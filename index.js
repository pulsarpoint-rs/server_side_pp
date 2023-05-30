var express = require('express');
const bodyParser = require('body-parser');
const qs = require('qs');
const { trace } = require('console');
var app = express();
var jsonParser = bodyParser.json()
// var cors = require('cors')

// activate cors for all routes
// app.use(cors())

function mergeObjects(obj1, obj2) {
        for (key in obj2) {
            if (!(key in obj1)) {
                obj1[key]= {};
            }
            if (obj2[key] instanceof Object) {
                if (obj2[key] instanceof Array) {
                    obj1[key] = obj2[key];
                    continue;
                }
                mergeObjects(obj1[key], obj2[key]);
            } else {
                obj1[key] = obj2[key];
            }
    }
    return obj1;
}

// Object.defineProperty(Object.prototype, 'status', {
//     get(){
//         console.trace("check status property");
//         return 1337
//     }
// });

app.get('/', function(req, res) {
    out = {
        "msg": "Prototype pollution example"
    }
    res.send(out);
});

app.get('/fork', function(req, res) {
    require('child_process').fork('child.js');
    res.send("forked");
});

app.get('/query_params', function(req, res) {
    let queries = req.query;
    let parsed = qs.parse(queries);
    res.send(parsed);
});

app.get("/show_empty_object", function(req, res) {
    let out = {};
    res.send(out);
});

// this is the vulnerable endpoint. This function takes input, merge that object in empty object with 
// using vulnerable mergeObjects function. If we submit request with __proto__ atributre 
// { __proto__ : { "injected_attribute": "injected value" }}
app.post('/json_reflection', jsonParser, function(req, res) {
    let out = {};
    out = mergeObjects(out, req.body);
    res.send(out);
});


// this is vulnerable endpoint used to demonstrate how we could use prototype pollution vulnerability to get RCE 
// Remote Code Execution vulnerability
app.get('/number_of_process', function(req, res) {
    let output = require('child_process').execSync('ps -ef | wc -l').toString();
    res.send(output);
});


app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
    