
var user = (function () {
    // declare user code here to avoid clashes with the mongo globals used by the test program

    function asArray(cursor) {
        function identity(obj) {
            return obj;
        }
        return cursor.map(identity);
    }

    function onlyOne(cursor){
        return cursor.next();
    }

    function part1(collection) {
        // TODO: Insert a new document with a driver named 'Carl Carlson'. Then insert a document with a Tesla with license plate ABC 123
        print("Part 1:");
        collection.insert([{name: 'Carl Carlson'}, {brand: 'Tesla', licensePlate: 'ABC 123'}]);
        print("Contents of database:");
        printjson(asArray(collection.find()));
    }

    function part2(collection) {
        //TODO: Find the Honda cars and return a array with projection of only the license plate.
        print("Part 2:");
        print("Contents of database:");
        printjson(asArray(collection.find()));
        return asArray(collection.find({brand: 'Honda'}, {licensePlate:true, _id:false}));
    }

    function part3(collection) {
        //TODO: Find the oldest person.
        print("Part 3:");
        print("Contents of database:");

        printjson(asArray(collection.find()));
        return onlyOne(collection.find().sort({age: -1}).limit(1));
    }

    function part4(collection) {
        //TODO: Find the youngest person older than 30.
        print("Part 4:");
        print("Contents of database:");
        printjson(asArray(collection.find()));
        return onlyOne(collection.find({ age: { $gt: 30}}).sort({age: 1}).limit(1));
    }

    function part5(collection) {
        //TODO: Everyone needs a increased priority by one.
        print("Part 5:");
        print("Contents of database:");
        printjson(asArray(collection.find()));
        collection.update({name:{$exists:true}}, {$inc:{priority: 1}}, {multi:true});
    }

    return {
        part1 : part1,
        part2 : part2,
        part3 : part3,
        part4 : part4,
        part5 : part5,
    };
})();

load('./tests.js');

cygniMongoDbTests({
    db : 'cygni-kompetens',
    host : 'localhost',
    port: 27017,
    collection : 'cars'
}, user);
