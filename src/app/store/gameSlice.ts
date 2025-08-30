import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GameState {
  lives: number;
  score: number;
  level: number;
  isVisible: boolean;
}

const initialState: GameState = {
  lives: 3,
  score: 0,
  level: 1,
  isVisible: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addScore(state, action: PayloadAction<number>) {
      state.score += action.payload;
    },
    loseLife(state) {
      if (state.lives > 0) state.lives -= 1;
    },
    addLife(state, action: PayloadAction<number>) {
      state.lives += action.payload;
    },
    setLevel(state, action: PayloadAction<number>) {
      state.level = action.payload;
    },
    resetGameData(state) {
      state.lives = initialState.lives;
      state.score = initialState.score;
      state.level = initialState.level;
    },
    setIsVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },
  },
});

export const { addScore, loseLife, setLevel, resetGameData, setIsVisible, addLife } = gameSlice.actions;
export default gameSlice.reducer;