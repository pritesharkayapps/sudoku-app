const GRID_SIZE = 9; // Size of the Sudoku grid (9x9)

const sudokuGrid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

// Checks if placing the number in a particular cell is safe according to Sudoku rules
function isNumberSafe(grid, row, col, num) {
    // Check if the number exists in the row
    for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[row][x] === num) {
            return false;
        }
    }

    // Check if the number exists in the column
    for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[x][col] === num) {
            return false;
        }
    }

    // Check if the number exists in the 3x3 subgrid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) {
                return false;
            }
        }
    }

    return true;
}

// Generates a valid Sudoku grid using backtracking
function generateGrid(grid) {
    // Find the first empty cell (null value)
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === null) {
                // Try random numbers from 1 to 9
                const shuffledNumbers = [...Array(9).keys()].map(x => x + 1).sort(() => Math.random() - 0.5); // Shuffle numbers 1-9

                for (let num of shuffledNumbers) {
                    if (isNumberSafe(grid, row, col, num)) {
                        grid[row][col] = num; // Place the number

                        // Recursively fill the rest of the grid
                        if (generateGrid(grid)) {
                            return true; // If successful, propagate true
                        }

                        // Backtrack if placing the number didn't work
                        grid[row][col] = null;
                    }
                }
                return false; // If no valid number can be placed, return false (backtrack)
            }
        }
    }
    return true;  // If all cells are filled, return true
}

generateGrid(sudokuGrid);

export default sudokuGrid;
