import { State } from './gameboard.reducer';
import { Player, PLAYER_O } from './player';

export const enum GameStatus {
    IN_PROGRESS,
    DRAW,
    WINNER_PLAYER_X,
    WINNER_PLAYER_O,
}

export const enum WinType {
    COLUMN,
    ROW,
    DIAGONAL_TOP_LEFT,
    DIAGONAL_TOP_RIGHT,
}

export interface GameWin {
    type: WinType;
    firstWinningSquare: {
        row: number;
        column: number;
    };
}

interface GameStatusWithWins {
    status: GameStatus;
    wins?: GameWin[];
}

export function detectStatus(squares: State['squares']): GameStatusWithWins {
    /** These are the current potential winners for each column. As we iterate through the rows, we update these to show which column still potentially has a winner. */
    const columnWinners = [...squares[0]];
    /** The current potential winner for the top-left -- bottom-right diagonal */
    let topLeftBottomRightDiagonalWinner = squares[0][0];
    /** The current potential winner for the top-right -- bottom-left diagonal */
    let topRightBottomLeftDiagonalWinner = squares[0][squares[0].length - 1];
    const wins = new Set<NonNullable<GameStatusWithWins['wins']>[0]>;
    let winner: Player | undefined;
    let hasAvailableSquares = false;

    for (let rowIndex = 0, row = squares[rowIndex]; rowIndex < squares.length; rowIndex += 1, row = squares[rowIndex]) {
        /** This is the potential winner for the current row. */
        let rowWinner = row[0];
        const isLastRow = rowIndex === squares.length - 1;
        for (let columnIndex = 0, square = row[columnIndex]; columnIndex < row.length; columnIndex += 1, square = row[columnIndex]) {
            hasAvailableSquares ||= square === undefined;

            // keep row winner if it is the same player
            rowWinner = rowWinner === square ? rowWinner : undefined;

            // keep column winner if it is the same player
            columnWinners[columnIndex] = columnWinners[columnIndex] === square ? columnWinners[columnIndex] : undefined;

            if (columnIndex === rowIndex) {
                // keep diagonal winner if it is the same player
                topLeftBottomRightDiagonalWinner = topLeftBottomRightDiagonalWinner === square ? square : undefined;
            }

            if (columnIndex === row.length - 1 - rowIndex) {
                // keep diagonal winner if it is the same player
                topRightBottomLeftDiagonalWinner = topRightBottomLeftDiagonalWinner === square ? square : undefined;
            }
        }
        if (rowWinner !== undefined) {
            wins.add({
                type: WinType.ROW,
                firstWinningSquare: {
                    row: rowIndex,
                    column: 0,
                },
            });
            winner = rowWinner;
        }
    }

    const winningColumnIndex = columnWinners.findIndex((square) => square !== undefined);
    if (winningColumnIndex > -1) {
        wins.add({
            type: WinType.COLUMN,
            firstWinningSquare: {
                row: 0,
                column: winningColumnIndex,
            },
        });
        winner = columnWinners[winningColumnIndex];
    }

    if (topLeftBottomRightDiagonalWinner !== undefined) {
        wins.add({
            type: WinType.DIAGONAL_TOP_LEFT,
            firstWinningSquare: {
                row: 0,
                column: 0,
            },
        });
        winner = topLeftBottomRightDiagonalWinner;
    }

    if (topRightBottomLeftDiagonalWinner !== undefined) {
        wins.add({
            type: WinType.DIAGONAL_TOP_RIGHT,
            firstWinningSquare: {
                row: 0,
                column: squares[0].length - 1,
            },
        });
        winner = topRightBottomLeftDiagonalWinner;
    }

    if (winner !== undefined) {
        return {
            status: winner === PLAYER_O ? GameStatus.WINNER_PLAYER_O : GameStatus.WINNER_PLAYER_X,
            wins: Array.from(wins),
        };
    }

    return {
        status: hasAvailableSquares ? GameStatus.IN_PROGRESS : GameStatus.DRAW,
    };
}
