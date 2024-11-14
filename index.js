let express = require('express');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

let app = express();
let PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// let db;

// (async () => {
//   db = await open({
//     filename: 'database.sqlite',
//     driver: sqlite3.Database,
//   });
// })();

let db;

// Function to initialize the database
async function initializeDatabase() {
  try {
    db = await open({
      filename: 'database.sqlite', // Consider using a managed DB in production
      driver: sqlite3.Database,
    });
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // Throw to stop server start in case of error
  }
}

// Wait for DB initialization before starting the server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log('Server is running on port ', PORT));
  })
  .catch((error) => {
    console.error(
      'Server failed to start due to database initialization error:',
      error
    );
  });

async function fetchAllRestaurants() {
  let query = 'SELECT * FROM restaurants';
  let result = await db.all(query, []);
  return { restaurants: result };
}

async function fetchRestaurantsByID(id) {
  let query = 'SELECT * FROM restaurants WHERE id=?';
  let result = await db.get(query, [id]);
  return { restaurants: result };
}

async function fetchRestaurantsByCuisine(cuisine) {
  let query = 'SELECT * FROM restaurants WHERE cuisine=?';
  let result = await db.all(query, [cuisine]);
  return { restaurants: result };
}

async function filterRestaurants(isVeg, hasOutdoorSeating, isLuxury) {
  let query =
    'SELECT * FROM restaurants WHERE isVeg=? AND hasOutdoorSeating=? AND isLuxury=?';
  let result = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  return { restaurants: result };
}

async function sortRestaurantsByRate() {
  let query = 'SELECT * FROM restaurants ORDER BY rating DESC';
  let result = await db.all(query, []);
  return { restaurants: result };
}

async function fetchDishes() {
  let query = 'SELECT * FROM dishes';
  let result = await db.all(query, []);
  return { dishes: result };
}

async function fetchDishesById(id) {
  let query = 'SELECT * FROM dishes WHERE id=?';
  let result = await db.all(query, [id]);
  return { dishes: result };
}

async function filterDishes(isVeg) {
  let query = 'SELECT * FROM dishes WHERE isVeg=?';
  let result = await db.all(query, [isVeg]);
  return { dishes: result };
}

async function sortDishesByPrice() {
  let query = 'SELECT * FROM dishes ORDER BY price ASC';
  let result = await db.all(query, []);
  return { dishes: result };
}

app.get('/restaurants', async (req, res) => {
  try {
    let result = await fetchAllRestaurants();

    if (result.restaurants === 0) {
      return res.status(404).json({ message: `No restaurants found! ` });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/restaurants/details/:id', async (req, res) => {
  let id = req.params.id;
  try {
    let result = await fetchRestaurantsByID(id);

    if (result.restaurants === undefined) {
      return res
        .status(404)
        .json({ message: `No restaurants found with the id ${id} !` });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  let cuisine = req.params.cuisine;
  try {
    let result = await fetchRestaurantsByCuisine(cuisine);

    if (result.restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: `No restaurants found with cuisine ${cuisine} !` });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/restaurants/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  let hasOutdoorSeating = req.query.hasOutdoorSeating;
  let isLuxury = req.query.isLuxury;

  try {
    let result = await filterRestaurants(isVeg, hasOutdoorSeating, isLuxury);
    console.log(result);
    if (result.restaurants.length === 0) {
      return res.status(404).json({
        message: `No restaurants found which is Veg ,Has outdoor seating and is Luxury`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let result = await sortRestaurantsByRate();
    if (result.restaurants.length === 0) {
      return res.status(404).json({
        message: `No restaurants found !`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/dishes', async (req, res) => {
  try {
    let result = await fetchDishes();
    if (result.dishes.length === 0) {
      return res.status(404).json({
        message: `No dishes found !`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/dishes/filter', async (req, res) => {
  let isVeg = req.query.isVeg;
  try {
    let result = await filterDishes(isVeg);
    if (result.dishes.length === 0) {
      return res.status(404).json({
        message: `No dishes found which are Veg!`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/dishes/details/:id', async (req, res) => {
  let id = req.params.id;
  try {
    let result = await fetchDishesById(id);
    if (result.dishes.length === 0) {
      return res.status(404).json({
        message: `No dishes found which have id ${id}!`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let result = await sortDishesByPrice();
    if (result.dishes.length === 0) {
      return res.status(404).json({
        message: `No dishes found!`,
      });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

// app.listen(PORT, () => console.log('Server is running on port ', PORT));
