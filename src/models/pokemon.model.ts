import mongoose, { Schema, Document } from 'mongoose';

export interface IPokemon extends Document {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  moves: Array<{
    move: {
      name: string;
      url: string;
    };
  }>;
  species: {
    name: string;
    url: string;
  };
  evolutionChain?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define subdocument schema WITHOUT _id
const TypeSchema = new Schema({
  slot: { type: Number, required: true },
  type: {
    name: { type: String, required: true },
    url: { type: String, required: true },
  }
}, { _id: false });

const MoveSchema = new Schema({
  move: {
    name: { type: String, required: true },
    url: { type: String, required: true },
  }
}, { _id: false });

const PokemonSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    sprites: {
      front_default: { type: String, required: true },
      back_default: { type: String, required: true },
      front_shiny: { type: String, required: true },
    },
    types: [TypeSchema],
    moves: [MoveSchema],
    species: {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
    evolutionChain: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PokemonSchema.index({ name: 'text' });

export default mongoose.model<IPokemon>('Pokemon', PokemonSchema);