require('./styles/main.sass'); // root stylesheeet - .css, .scss or .sass

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

//////////////////////////////////////algorithm part//////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

//settings
const GRID_HEIGHT = 40;
const GRID_WIDTH = 40;
const MAX_ROOMS = 5;
const ROOM_SIZE_RANGE = [7, 12];

const c= { GRID_HEIGHT, GRID_WIDTH, MAX_ROOMS, ROOM_SIZE_RANGE};

const createDungeon = () => {
	// HELPER FUNCTIONS FOR CREATING THE MAP
	const isValidRoomPlacement = (grid, {x, y, width = 1, height = 1}) => {
		// check if on the edge of or outside of the grid
		if (y < 1 || y + height > grid.length - 1) {
			return false;
		}
		if (x < 1 || x + width > grid[0].length - 1) {
			return false;
		}

		// check if on or adjacent to existing room
		for (let i = y - 1; i < y + height + 1; i++) {
			for (let j = x - 1; j < x + width + 1; j++) {
				if (grid[i][j].type === 'floor') {
					return false;
				}
			}
		}
		// all grid cells are clear
		return true;
	};

	const placeCells = (grid, {x, y, width = 1, height = 1, id}, type = 'floor') => {
		for (let i = y; i < y + height; i++) {
			for (let j = x; j < x + width; j++) {
				grid[i][j] = {type, id};
			}
		}
		return grid;
	};

	const createRoomsFromSeed = (grid, {x, y, width, height}, range = c.ROOM_SIZE_RANGE) => {
		// range for generating the random room heights and widths
		const [min, max] = range;

		// generate room values for each edge of the seed room
		const roomValues = [];

		const north = { height: _.random(min, max), width: _.random(min, max) };
		north.x = _.random(x, x + width - 1);
		north.y = y - north.height - 1;
		north.doorx = _.random(north.x, (Math.min(north.x + north.width, x + width)) - 1);
		north.doory = y - 1;
    north.id= 'N';
		roomValues.push(north);

		const east = { height: _.random(min, max), width: _.random(min, max) };
		east.x = x + width + 1;
		east.y = _.random(y, height + y - 1);
		east.doorx = east.x - 1;
		east.doory = _.random(east.y, (Math.min(east.y + east.height, y + height)) - 1);
    east.id= 'E';
		roomValues.push(east);

		const south = { height: _.random(min, max), width: _.random(min, max) };
		south.x = _.random(x, width + x - 1);
		south.y = y + height + 1;
		south.doorx = _.random(south.x, (Math.min(south.x + south.width, x + width)) - 1);
		south.doory = y + height;
    south.id='S';
		roomValues.push(south);

		const west = { height: _.random(min, max), width: _.random(min, max) };
		west.x = x - west.width - 1;
		west.y = _.random(y, height + y - 1);
		west.doorx = x - 1;
		west.doory = _.random(west.y, (Math.min(west.y + west.height, y + height)) - 1);
    west.id='W';
		roomValues.push(west);

		const placedRooms = [];
		roomValues.forEach(room => {
			if (isValidRoomPlacement(grid, room)) {
				// place room
				grid = placeCells(grid, room);
				// place door
				grid = placeCells(grid, {x: room.doorx, y: room.doory}, 'door');
				// need placed room values for the next seeds
				placedRooms.push(room);
			}
		});
		  console.log(placedRooms);
		return {grid, placedRooms};
	};

	// BUILD OUT THE MAP

	// 1. make a grid of 'empty' cells, with a random opacity value (for styling)
	let grid = [];
	for (let i = 0; i < c.GRID_HEIGHT; i++) {
		grid.push([]);
		for (let j = 0; j < c.GRID_WIDTH; j++) {
			grid[i].push({type: 0, opacity: _.random(0.3, 0.8)});
		}
	}

	// 2. random values for the first room
	const [min, max] = c.ROOM_SIZE_RANGE;
	const firstRoom = {
		x: _.random(1, c.GRID_WIDTH - max - 15),
		y: _.random(1, c.GRID_HEIGHT - max - 15),
		height: _.random(min, max),
		width: _.random(min, max),
    id: 'O'
	};

	// 3. place the first room on to grid
	grid = placeCells(grid, firstRoom);

	// 4. using the first room as a seed, recursivley add rooms to the grid
	const growMap = (grid, seedRooms, counter = 1, maxRooms = c.MAX_ROOMS) => {
		if (counter + seedRooms.length > maxRooms || !seedRooms.length) {
			return grid;
		}

		grid = createRoomsFromSeed(grid, seedRooms.pop());
		seedRooms.push(...grid.placedRooms);
		counter += grid.placedRooms.length;
		return growMap(grid.grid, seedRooms, counter);
	};

	return growMap(grid, [firstRoom]);
};
///////////////////////////////////////////begin React part//////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

let firstStore= {
  dungeon: createDungeon()
}

class Dungeon extends Component {
  render() {
    let { store } = this.props;

      const cells= store.map((element, index) => {
      return (
        <div className='row' key={Date.now()+index}>
        {
            element.map((cell, i) => {
              return (
                <div className={
                (cell.type == 'floor' || cell.type == 'door') ? 'cell ' + cell.type : 'cell'
                   }
                style={{opacity: cell.opacity}}
                key={i}
                 >{cell.id}
                </div>
              )
            })
          }
        </div>
      )
    });

    return(
      <div className='app'>
        <div className='flex-container'>
            {cells}
        </div>
      </div>

    )
  }
};


ReactDOM.render(
  <Dungeon store={firstStore.dungeon}/>,
  document.getElementById("container")
);
