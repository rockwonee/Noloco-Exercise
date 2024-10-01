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
    } catch (error) {
        res.status(400).json({error: 'Error with fetching the data'});   // try and catch to show errors
    } console.log("Data fetched\n");                                       // if data is successfully fetched
};          
fetchData();                                                             // call to fetch the data

// showing entire dataset 
app.get('/dataset', (req, res) => {
    res.json(MAINDATA);                                                   // .json instead of .send because it is specifically JSON data
});


const isValidDate = (dateValue) => {                                      // to check if a value is a date (REF: https://bito.ai/resources/javascript-check-valid-date-javascript-explained/)
    return !isNaN(Date.parse(dateValue));
}

const DataType = (values) => {

    if (typeof values === 'boolean') return 'BOOLEAN';                    // pass boolean first because bool counts as false for NaN
    if (!isNaN(values)) {
        if (values % 1 == 0) {
            return 'INTEGER';
        }   else return 'FLOAT';
        
    } else {
    
    if (isValidDate(values)) return 'DATE';
    if (typeof values === 'string') return 'TEXT';
            }
            
            
    return 'Unknown data type'; //2021-12-13T16:55:02
}

const toCamelCase = str => {                                               // function to convert string to camelCase (REF: https://www.30secondsofcode.org/js/s/string-case-conversion/)
    const s =
      str &&
      str
        .match(
          /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
        )
        .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
        .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
  };


const CreatedSchema = (data) => {                                         // data is the parameter  
    const first = data[1];                                                // take the second object from the data array, because first one has null values   
    const Schema = Object.keys(first).map((key) => {                      // returns the keys/labels of the data
        const value = first[key];                                         // map iterates over the keys

        return {
            display: key, // returns the display name
            name: toCamelCase(key),    // returns the camelCase version of the name
            type: DataType(value),  // returns the type of the value
            options: []   // if there is an option, otherwise it is empty 
        }
    });
    return Schema;
}

// getting the schema from the dataset
app.get('/schema', (req, res) => {          
    res.json(CreatedSchema(MAINDATA));          
})









// runs the server
app.listen(PORT, () => {
    console.log(`Server started listning on port ${PORT} at http://localhost:${PORT}/`);
})