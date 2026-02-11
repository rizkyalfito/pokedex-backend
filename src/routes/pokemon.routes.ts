import express from 'express';
import {
  getPokemonList,
  getPokemonDetail,
  searchPokemon,
  syncPokemonData,
} from '../controllers/pokemon.controller.js';

const router = express.Router();

// Get Pokemon list with pagination
router.get('/', getPokemonList);

// Search Pokemon
router.get('/search', searchPokemon);

// Sync Pokemon data from PokeAPI (utility)
router.post('/sync', syncPokemonData);

// Get Pokemon detail by ID or name
router.get('/:identifier', getPokemonDetail);

export default router;