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
  types: {
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }[];
  moves: {
    move: {
      name: string;
      url: string;
    };
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
    slot: number;
  }[];
  species: {
    name: string;
    url: string;
  };
  evolutionChain?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const TypeSchema = new Schema(
  {
    slot: Number,
    type: {
      name: String,
      url: String,
    },
  },
  { _id: false }
);

const MoveSchema = new Schema(
  {
    move: {
      name: String,
      url: String,
    },
  },
  { _id: false }
);

const StatSchema = new Schema(
  {
    base_stat: Number,
    effort: Number,
    stat: {
      name: String,
      url: String,
    },
  },
  { _id: false }
);

const AbilitySchema = new Schema(
  {
    ability: {
      name: String,
      url: String,
    },
    is_hidden: Boolean,
    slot: Number,
  },
  { _id: false }
);

const PokemonSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    height: Number,
    weight: Number,
    sprites: {
      front_default: String,
      back_default: String,
      front_shiny: String,
    },
    types: [TypeSchema],
    moves: [MoveSchema],
    stats: [StatSchema],
    abilities: [AbilitySchema],
    species: {
      name: String,
      url: String,
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
