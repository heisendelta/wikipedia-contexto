from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

import spacy
from wordfreq import zipf_frequency

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import pickle
from pathlib import Path
import random

# Constants (glove, zipf boundaries) loaded locally
DATASET_PATH = Path(__file__).parent.parent / 'data'
GLOVE_PATH = DATASET_PATH / 'glove_embeddings'

with open(GLOVE_PATH / 'words.txt', 'r') as f:
    words = f.read().splitlines()

with open(GLOVE_PATH / 'glove.pkl', 'rb') as f:
    glove = pickle.load(f)

zipf_lower_bound = 4.0
zipf_upper_bound = 5.0



target_word = None
similarity_ranking = None

all_words = list(glove.keys())
used_words = set()

nlp = spacy.load('en_core_web_sm')
def get_word_lemma(word):
    return nlp(word)[0].lemma_

def cosine_similarity_matrix(guess_vec, all_vecs):
    guess_norm = np.linalg.norm(guess_vec)
    all_norms = np.linalg.norm(all_vecs, axis=1)
    dot_products = all_vecs @ guess_vec
    return dot_products / (all_norms * guess_norm)

def create_similarity_ranking(word1):
    word1_vec = glove[word1]
    all_vec = list(glove.values())

    similarities = cosine_similarity_matrix(word1_vec, all_vec)
    sorted_similarity_indices = np.argsort(-similarities).tolist()
    return sorted_similarity_indices

def get_ranking(word2):
    if similarity_ranking is None:
        raise TypeError('Similarity ranking uninitialized')

    return similarity_ranking.index(all_words.index(word2)) + 1



### API stuff

class GuessRequest(BaseModel):
    word: str

@app.post('/start_game')
def start_game():
    global target_word, similarity_ranking

    target_word = random.choice(words)
    similarity_ranking = create_similarity_ranking(target_word)

    return {'mesage': 'Game started', 'vocab_size': len(all_words)}

@app.post('/guess')
def guess(req: GuessRequest):
    guess_word = req.word
    original_word = guess_word
    
    zipf_score = zipf_frequency(guess_word, lang='en', wordlist='best')
    if zipf_score > zipf_upper_bound:
        return {'valid_guess': False, 'word': guess_word, 'message': 'too common.', 'rank': None}
    elif zipf_score < zipf_lower_bound:
        return {'valid_guess': False, 'word': guess_word, 'message': 'too uncommon.', 'rank': None}

    if guess_word not in all_words:
        word_lemma = get_word_lemma(guess_word)

        if word_lemma in all_words:
            guess_word = word_lemma
        else:
            return {'valid_guess': False, 'word': original_word, 'message': 'not found.', 'rank': None}
        
    if guess_word in used_words:
        return {'valid_guess': False, 'word': original_word, 'message': 'already guessed.', 'rank': None}
    used_words.add(guess_word)

    ranking = get_ranking(guess_word)
    return {'valid_guess': True, 'word': guess_word, 'message': f'ranked #{ranking}.', 'rank': ranking} # not using the mesasge currently
