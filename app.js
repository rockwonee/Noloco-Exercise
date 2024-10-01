/*
Your task is to fetch the Dublin Bikes dataset, derive its schema and allow users to perform basic queries on that data.
To do this, create a simple web API that has two endpoints.
-----
GET /schema
This endpoint returns the most appropriate data schema (as defined below) of the Dublin Bikes dataset
-----
POST /data
This endpoint returns the data fetched from the Dublin Bikes dataset after applying any filters from the body of the request
using the schema's standardized field names instead of the names provided by the dataset.
*/

/*
ran following in terminal:
npm init -y  // to get package.json file
npm install express  // to install express framework
npm i -g nodemon  // to get node monitor which constantly refreshes server so don't have to save and run over and over

*/
const express = require('express'); // adding express package/library
const app = express();

const PORT = 3000; // assigning a port number

app.use(express.json()); // middleware parsing for JSON files

// creates a Home/Root Page for the application
app.get('/', (req, res) => {
    res.send('DUBLIN BIKE STANDS DATA');

})

// fetching the data
// async so it completes before continuing with the rest of the code
// promise has to be fulfilled
const fetchData = async () => {
    try {
        const fetchedData = await fetch('https://app-media.noloco.app/noloco/dublin-bikes.json');
        MAINDATA = await fetchedData.json();
    } catch (err) {
        res.status(400).json({error: 'Error with fetching the data'});          // try and catch to show errors
    } console.log("Data fetched");                                              // if data is successfully fetched
};          
fetchData();                                                                    // call to fetch the data

// showing entire dataset 
app.get('/dataset', (req, res) => {
    res.send(MAINDATA);
})









// runs the server
app.listen(PORT, () => {
    console.log(`Server started listning on port ${PORT} at http://localhost:${PORT}/`);
})