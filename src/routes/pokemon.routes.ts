import express from 'express';
import Pokemon from '../models/pokemon.model.js';
import {
  getPokemonList,
  getPokemonDetail,
  searchPokemon,
  syncPokemonData,
} from '../controllers/pokemon.controller.js';

const router = express.Router();

// Get Pokemon list with pagination
router.get('/', getPokemonList);

// Get all Pokemon (for admin or utility purposes)
router.get('/all', async (req, res) => {
  const all = await Pokemon.find().sort({ id: 1 });
  res.json({ success: true, total: all.length, data: all });
});

// Search Pokemon
router.get('/search', searchPokemon);

// Sync Pokemon data from PokeAPI (utility)
router.post('/sync', syncPokemonData);

// Get Pokemon detail by ID or name
router.get('/:identifier', getPokemonDetail);

export default router;