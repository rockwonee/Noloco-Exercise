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

let MAINDATA = [];
// fetching the data
// async so it completes before continuing with the rest of the code
// promise has to be fulfilled
const fetchData = async () => {
    try {
        const fetchedData = await fetch('https://app-media.noloco.app/noloco/dublin-bikes.json');
        MAINDATA = await fetchedData.json();
    } catch (error) {
        res.status(400).json({error: 'Error with fetching the data'});    // try and catch to show errors
    } console.log("Data fetched\n");
    //console.log(MAINDATA);                                              // if data is successfully fetched
};          
fetchData();                                                              // call to fetch the data

// showing entire dataset 
app.get('/dataset', (req, res) => {
    res.json(MAINDATA);                                                   // .json instead of .send because it is specifically JSON data
});



// 2021-12-13T16:55:02 date format
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
    
    if (isValidDate(values)) return 'DATE';                             // called from isValidDate function above
    if (typeof values === 'string') return 'TEXT';
            }
            
    return 'Unknown data type'; 
}

const toCamelCase = str => {                                              // function to convert string to camelCase (REF: https://www.30secondsofcode.org/js/s/string-case-conversion/)
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


app.post('/data', (req, res) => {
    //res.send('POST recieved successfully');
    //console.log('Post sent');

    //const AvailableFilters = ["id", "harvestTimeUtc", "stationId", "Station id", "availableBikeStands", "bikeStands", "availableBikes", "banking", "bonus", "lastUpdate", "status", "address", "name", "latitude", "longitude"];
    
    const MAINDATASCHEMA = CreatedSchema(MAINDATA);                       // getting the schema of the MAINDATA for filtering
    //const AvailableFilters = MAINDATASCHEMA.map(field => field.name);   // to get original name 
    const AvailableFilters = MAINDATASCHEMA.map(field => field.display);
    const AvailableOperators = ["eq", "lt", "gt"];
    
    const { where } = req.body;

    if (!where) {
        return res.status(400).json({error: 'ERROR: where required in body'});
    }

    const Filters = Object.keys(where);                                   // get the object keys of "where" from body i.e. the filters 'stationId, id, name'


    if (Filters.some(filter => !AvailableFilters.includes(filter))) {     // checking if the key of "where" (Filters) matches one of the AvailableFilters (REF: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
        return res.status(400).json({error: `ERROR: this filter: ${Filters} does not match available filters`});
    };

    // to get the keys within the object of the filters i.e. the operators "lt, gt, eq"
    const Operators = Object.keys(where[Filters]);

    if (Operators.some(filter => !AvailableOperators.includes(filter))) {
        return res.status(400).json({error: `ERROR: operator ${Operators} does not match available operators`});
    };
    
   
    /*const ConvertOperators = {
        "lt": "<",
        "gt": ">",
        "eq": "="
    };
    */

    // function to perform the <, > or = operation betwee the data and the body
    const OperatorFunction = (x, y, operator) => {
        if (operator === 'lt'){
            return x < y;
        }
        if (operator === 'gt'){
            return x > y;
        }
        if (operator === 'eq'){
            return x == y;
        }
    }   
                                                              
    // filter the MAINDATA using the operator function 
    const FilteredData = MAINDATA.filter(MData => OperatorFunction(MData[Filters], where[Filters][Operators], Operators[0]));

    //const FilteredData = MAINDATA.filter(b => b["Station id"] < where[Filters][Operators])
    
    console.log([Filters], Operators, where[Filters][Operators] );

    if (FilteredData.length === 0){
        return res.status(400).json({error: 'This data does not exist'});
    }
    res.json(FilteredData);

    //const filterobject = where.Filters;

    //const Operators = Object.keys(filterobject);

    //console.log(filterobject)

    //if (Operators.some(filter => !AvailableOperators.includes(filter))){
    //    return res.status(400).json({error: `ERROR: this operator: ${Operators} does not match available operators`})
    //}

    //return res.send('SUCCESSFUL');
    
})

// route to find an ID within the dataset
app.get('/data/:id', (req, res) => {

// need req.params.id because ID is a parameter (44433632)
// parseInt used so ID is treated as an integer
const findData = MAINDATA.find(x => x.id === parseInt(req.params.id)); 
if (!findData) {
    return res.status(404).json({error: 'Data with that ID was not found'});
}
res.json(findData); // return the JSON format of the data
})

// runs the server
app.listen(PORT, () => {
    console.log(`Server started listning on port ${PORT} at http://localhost:${PORT}/`);
})