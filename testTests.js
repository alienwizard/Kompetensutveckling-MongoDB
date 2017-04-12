load('./tests.js');
(function (){

    var g;

    /**
     * calls fun once for each element in list until fun returns a truth value.
     *  fun(list[i], i, list)
     * @param list the iterated list
     * @param fun the function called
     * @param def default value to return if fun did not return any
     * @returns the first truth value returned by fun, else def
     */
    function iFor(list, fun, def) {
        var i = 0,
            l = list.length,
            tmp;
        for(; i < l; i+=1) {
            tmp = fun(list[i], i, list);
            if (tmp) return tmp;
        }
        return def;
    }

    function preTestStart( message) {
        print('Starting test: ', message);
    }

    function postTestEndOk( message) {
        print('Passed test:', message);
    }


    function noError(message, connect, userObj){
        preTestStart(message);
        try{
            cygniMongoDbTests(connect, userObj);
        } catch (e){
            throw e;
        }
        postTestEndOk(message);
    }

    function errorAs(message, connect, cuserObj, expectedErrors) {

        function containsAll(findAll, inThis) {
            // aborting inner loop causes outer loop to not abort
            return !iFor(findAll, function (item) {
                return inThis.indexOf(item) === -1;
            }, false);
        }

        preTestStart(message);
        try{
            cygniMongoDbTests(connect, cuserObj);
        } catch (e) {
            if (typeof e !== 'string') {
                throw e;
            }
            if (!containsAll(expectedErrors, e)){
                throw "Failed test '" + message + " ' failed expect: '" + e + "' tested for '" + JSON.stringify(expectedErrors) + "'";
            }
            postTestEndOk(message);
            return true;
        }
        throw "Failed test '" + message + " ' expected a error to be trown, but none was caught.'";
    }

    function asArray(cursor) {
        function identity(obj) {
            return obj;
        }
        return cursor.map(identity);
    }

    function doNothing(){}

    function fixedValue(value){
        return function (){
            return value;
        };
    }

    function part1Solved(collection) {
        collection.insert([{name:"Carl Carlson"},{brand:"Tesla", licensePlate:"ABC 123"}]);
    }

    function part2Solved(collection) {
        return asArray(collection.find({brand :'Honda'}, {_id:false ,licensePlate:true}));
    }

    function part3Solved(collection) {
        return collection.find({age:{'$exists':true}}).sort({age:-1}).limit(1).next();
    }

    function part4Solved(collection) {
        return collection.find({age:{'$gt':30}}).sort({age:1}).limit(1).next();
    }

    function part5Solved(collection) {
        collection.update({},{'$inc':{priority:1}}, {multi:true});
    }

    g = {
        db : 'cygni-kompetens',
        host : 'localhost',
        port: 27017,
        collection : 'cars'
    };


    print("Using global properties:");
    printjson(g);

    errorAs("No input",null,null, ['object']);
    errorAs("Missing input 1",null,{}, ['object']);
    errorAs("Missing properties 1",{}, null, ['property']);

    errorAs("Missing properties 2",  {db:g.db}, null, ['property']);
    errorAs("Missing input 2", g, null, ['object']);
    errorAs("Missing property, 3	", g, {}, ['property']);
    errorAs("Asssume parameters are functions, 1", g, {part1:''}, ['function']);
    errorAs("Asssume parameters are functions, 2", g, {part1:doNothing, part2:''}, ['function']);
    errorAs("Asssume parameters are functions, 3", g, {part1:doNothing, part2:doNothing, part3:''}, ['function']);
    errorAs("Asssume parameters are functions, 4", g, {part1:doNothing, part2:doNothing, part3:doNothing, part4:''}, ['function']);
    errorAs("Part1. No change in db", g, {part1:doNothing, part2:doNothing, part3: doNothing, part4:doNothing}, ['expected 1', 'found 0']);
    errorAs("Part1. Dubble insert", g, {part1:function (c) {
        part1Solved(c);
        part1Solved(c);
    }, part2:doNothing, part3:doNothing, part4:doNothing}, ['expected 1', 'found 2']);
    errorAs("Part1. Solved, return nothing", g, {part1:part1Solved, part2:doNothing, part3:doNothing, part4:doNothing}, ['return', 'array']);
    errorAs("Part2. Return empty object", g, {part1:part1Solved, part2:fixedValue({}), part3:doNothing, part4:doNothing}, ['return', 'array']);
    errorAs("Part2. Return 1 element array", g, {part1:part1Solved, part2:fixedValue(['','']), part3:doNothing, part4:doNothing}, ['return', 'licensePlate']);
    errorAs("Part2. Return 1 element array", g, {part1:part1Solved, part2:fixedValue([{m:'s'}, {m:'s'}]), part3:doNothing, part4:doNothing}, ['return', 'licensePlate']);

    errorAs("Part2. Solved, part 3 return nothing", g, {part1:part1Solved, part2:part2Solved, part3:doNothing, part4:doNothing}, ['test 3', 'undefined', 'object']);
    errorAs("Part3. return empty name", g, {part1:part1Solved, part2:part2Solved, part3:fixedValue({name:''}), part4:doNothing}, ['name','oldest']);
    errorAs("Part3. return only name", g, {part1:part1Solved, part2:part2Solved, part3:fixedValue({name:'a fake name'}), part4:doNothing}, ['property']);
    errorAs("Part3. done", g, {part1:part1Solved, part2:part2Solved, part3:part3Solved, part4:doNothing}, ['test 4', 'undefined', 'object']);
    errorAs("Part4. using part 3 solution", g, {part1:part1Solved, part2:part2Solved, part3:part3Solved, part4:part3Solved}, ['test 4','property', 'youngest older than', ]);

    errorAs("Part4. done", g, {part1:part1Solved, part2:part2Solved, part3:part3Solved, part4:part4Solved, part5:doNothing}, ['priority', 'find each']);
    noError("Part5. done", g, {part1:part1Solved, part2:part2Solved, part3:part3Solved, part4:part4Solved, part5:part5Solved});

    print ('DONE running tests');

})();
