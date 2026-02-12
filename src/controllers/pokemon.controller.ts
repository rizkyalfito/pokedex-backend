import type { Request, Response } from 'express';
import axios from 'axios';
import Pokemon from '../models/pokemon.model.js';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

// Helper function to fetch data from PokeAPI
async function fetchFromPokeAPI(url: string) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching from PokeAPI: ${url}`, error);
    throw error;
  }
}

// Helper function to fetch evolution chain
async function fetchEvolutionChain(speciesUrl: string) {
  try {
    const speciesData = await fetchFromPokeAPI(speciesUrl);
    const evolutionChainUrl = speciesData.evolution_chain.url;
    const evolutionData = await fetchFromPokeAPI(evolutionChainUrl);
    return evolutionData;
  } catch (error) {
    console.error('Error fetching evolution chain:', error);
    return null;
  }
}

// Get Pokemon list with pagination
export async function getPokemonList(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    // Check if we have Pokemon in DB
    const totalInDB = await Pokemon.countDocuments(query);
    
    if (totalInDB === 0 && !search) {
      // If DB is empty, fetch from API
      await fetchAndSaveInitialPokemon();
    }

    const pokemon = await Pokemon.find(query)
      .select('id name sprites types')
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Pokemon.countDocuments(query);
    const hasMore = skip + limit < total;

    res.json({
      success: true,
      data: pokemon,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error in getPokemonList:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Pokemon list',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Get Pokemon detail by ID or name
export async function getPokemonDetail(req: Request, res: Response) {
  try {
    const { identifier } = req.params;
    
    // Type guard
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid identifier',
      });
    }
    
    // Check if identifier is a number (ID) or string (name)
    const query = isNaN(Number(identifier))
      ? { name: identifier.toLowerCase() }
      : { id: parseInt(identifier) };

    let pokemon = await Pokemon.findOne(query).lean();

    // If not in DB, fetch from API
    if (!pokemon) {
      pokemon = await fetchAndSavePokemon(identifier);
    }

    // If evolution chain is not populated, fetch it
    if (pokemon && !pokemon.evolutionChain) {
      const evolutionChain = await fetchEvolutionChain(pokemon.species.url);
      if (evolutionChain) {
        await Pokemon.findOneAndUpdate(
          query,
          { evolutionChain },
          { new: true }
        );
        pokemon.evolutionChain = evolutionChain;
      }
    }

    if (!pokemon) {
      return res.status(404).json({
        success: false,
        message: 'Pokemon not found',
      });
    }

    res.json({
      success: true,
      data: pokemon,
    });
  } catch (error) {
    console.error('Error in getPokemonDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Pokemon detail',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Fetch and save a single Pokemon
async function fetchAndSavePokemon(identifier: string | number) {
  try {
    const pokemonData = await fetchFromPokeAPI(
      `${POKEAPI_BASE_URL}/pokemon/${identifier}`
    );

    const limitedMoves = pokemonData.moves.slice(0, 10);

      const pokemon = new Pokemon({
        id: pokemonData.id,
        name: pokemonData.name,
        height: pokemonData.height,
        weight: pokemonData.weight,
        sprites: {
          front_default: pokemonData.sprites.front_default,
          back_default: pokemonData.sprites.back_default,
          front_shiny: pokemonData.sprites.front_shiny,
        },
        types: pokemonData.types.map((t: any) => ({
          slot: t.slot,
          type: {
            name: t.type.name,
            url: t.type.url,
          },
        })),
        moves: limitedMoves,
        species: pokemonData.species,
      });
      await pokemon.save();
    return pokemon.toObject();
  } catch (error) {
    console.error(`Error fetching Pokemon ${identifier}:`, error);
    throw error;
  }
}

// Fetch and save initial Pokemon (first 100)
async function fetchAndSaveInitialPokemon() {
  try {
    console.log('Fetching initial Pokemon from PokeAPI...');
    
    // Fetch first 100 Pokemon
    const listData = await fetchFromPokeAPI(
      `${POKEAPI_BASE_URL}/pokemon?limit=100&offset=0`
    );

    const promises = listData.results.map(async (pokemon: any) => {
      try {
        const exists = await Pokemon.findOne({ name: pokemon.name });
        if (!exists) {
          await fetchAndSavePokemon(pokemon.name);
        }
      } catch (error) {
        console.error(`Failed to fetch ${pokemon.name}:`, error);
      }
    });

    await Promise.all(promises);
    console.log('✅ Initial Pokemon data saved to MongoDB');
  } catch (error) {
    console.error('Error in fetchAndSaveInitialPokemon:', error);
    throw error;
  }
}

// Search Pokemon
export async function searchPokemon(req: Request, res: Response) {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const pokemon = await Pokemon.find({
      name: { $regex: query, $options: 'i' },
    })
      .select('id name sprites types')
      .limit(20)
      .lean();

    res.json({
      success: true,
      data: pokemon,
    });
  } catch (error) {
    console.error('Error in searchPokemon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search Pokemon',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Sync Pokemon data from PokeAPI (utility endpoint)
export async function syncPokemonData(req: Request, res: Response) {
  try {
    await fetchAndSaveInitialPokemon();
    
    res.json({
      success: true,
      message: 'Pokemon data synced successfully',
    });
  } catch (error) {
    console.error('Error in syncPokemonData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Pokemon data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}