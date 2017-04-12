
function cygniMongoDbTests(dbinfo, user){
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

    /**
     * calls fun with each of the property-value mappings in object until fun returns a truth value
     * fun(key, object[key], object)
     * @param object
     * @param fun
     * @param def
     * @returns the first truth value returned by fun, if any, otherwise it returns def
     */
    function oFor(object, fun, def) {
        var key,
            tmp;
        for(key in object) {
            tmp = fun(key, object[key], object);
            if (tmp) {
                return tmp;
            }
        }
        return def;
    }


    /** Tests if two objects has the same properties and that those properties have the same values.
     * @param objA Object to compare
     * @param objB Object to compare
     * @returns true if all non-prototype properties on each object can be found on the other with the same value
     */
    function objectFlatMatch(objA, objB) {

        function mergeObjects(target,source) {
            oFor(source, function (key, val){
                target[key] = val;
            });
            return target;
        }

        function match(a, b) {
            return a == b;
        }

        var allProps = mergeObjects(mergeObjects({}, objB), objA);

        return !oFor(allProps, function (property, value) {
            var aProp = objA[property],
                bProp = objB[property];
            if(objA.hasOwnProperty(property) !== objB.hasOwnProperty(property)) {
                return 'property not on both objects';
            }
            if (match(aProp, bProp)) {
                //continue
            } else {
                return 'values not matching';
            }
        }, false);
    }

    /** Creat a mapping based on a object array
     * @param array a array to index
     * @param readKey a function that returns the key by what to index based on a item in the array
     * @param readValue a function that returns the value by what to index based on a item in the array
     * @returns a object with properties corresponding to the values returned by readKey with the last value returned by readValue for that key
     */
    function makeIndex(array, readKey, readValue){
        var ret = {};
        iFor(array, function (item){
            ret[readKey(item)] = readValue(item);
        });
        return ret;
    }

    function arrayOfLength(len){
        var ret;
        if (len < 1 ){
            return [];
        }
        ret = arrayOfLength(len - 1);
        ret.push(len - 1);
        return ret;
    }


    function makeId(charset, length, prefix) {
        var i,
            generatedToken;
        if (length < 1) {
            return prefix;
        }

        generatedToken = charset.charAt(Math.floor(Math.random() * charset.length));
        return makeId(charset, length-1, prefix + generatedToken);
    }


    function asArray(cursor) {
        function identity(obj) {
            return obj;
        }
        return cursor.map(identity);
    }



    function containsAll(findAll, inThis, comparator) {
        // aborting inner loop causes outer loop to not abort
        return !iFor(findAll, function (item) {
            return !iFor(inThis,function (candidate) {
                if (comparator(item, candidate)) {
                    return 'itemFound';//aborting loop
                }
            }, false);
        });
    }

    function makePlate() {
        var numbers = '1234567890',
            letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return makeId(numbers, 3,'') + ' ' + makeId(letters,3,'');
    }

    function car(brand, plate) {
        return {brand: brand, licensePlate : plate};
    }
    function describe(description, fun) {
        fun.description = description;
        return fun;
    }

    function checkInput(obj, objDesc, template ) {
        if(!obj) {
            throw "Expected '" + objDesc + "' to be a object";
        }
        oFor(template, function (key, value) {
            if(!obj.hasOwnProperty(key)) {
                throw "Expected '" + objDesc + "'\n to have property '" + key + "'.";
            }
            if (!(template[key](obj, obj[key]))) {
                throw "Expected '" + objDesc + "'\n to have property '" + key + "' conforming to '" + template[key].description + "'.";
            }
        });
    }


    var nonEmptyString = describe("a not empty string on object", function (obj, value) {
        return value && (typeof value === 'string');
    }),
        isFunction = describe("is a function on object", function (obj, value){
            return value && (typeof value === "function");
        }),
        isValue = function (savedValue, valueDesc){
            var r = function (obj, value){
                return savedValue === value;
            };
            return describe("is the value " + savedValue + "[" + valueDesc + "] ",r);
        };

    checkInput(dbinfo, 'parameter 0', {db:nonEmptyString, host:nonEmptyString, collection:nonEmptyString});
    checkInput(user,'parameter 1', {part1:isFunction, part2:isFunction, part3:isFunction, part4:isFunction});

    function fromNameAndAges(names, ages){
        return ages.map(function (item, index){
            return {name:names[index], age:item};
        });
    }
    function fromNameAndAtribute(names, atribute, ages){
        return ages.map(function (item, index){
            var r = {name:names[index]};
            r[atribute] = item;
            return r;
        });
    }



    function names(){
        return [
            'Arne Anderson',
            'Berit Birgitson',
            'Cecillia Carlson',
            'David Danielsson',
            'Eskil Eriksson',
            'Frida Fagerson',
            'Gunnar Gabrielsson',
            'Hulda Hubsson',
            //      'Inger Ivarsson',
            //      'Jannica Johansson',
            //      'Karl Karlsson',
            //      'Lars Larsson',
            //      'Maria Magnusson',
            //      'Nisse Nicklasson',
            //      'Ovelia Ockelberg',
            //      'Patrik Pettersson',
        ];
    }

    var db = connect(dbinfo.host +':' + dbinfo.port+'/' + dbinfo.db),
        collection = db.getCollection(dbinfo.collection),
        setCollectionContent = function (newValues) {
            collection.remove({});
            sleep(100)
            collection.insert(newValues);
        },
        expectCount = function (count, querry){
            var res = collection.count(querry);
            if (res !== count) {
                throw 'Test failed. Counted ' + JSON.stringify(querry) +' and expected ' + count + ' but found ' + res;
            }
        },
        expectAll = function (expected, querry) {
            var res = asArray(collection.find(querry,{'_id':false}));
            if(!containsAll(expected, res, objectFlatMatch)){
                throw 'Test failed. Searched for ' + JSON.stringify(querry) + '\n and expected to find each item in ' + JSON.stringify(expected, null, 2) + '\n but found ' + JSON.stringify(res, null, 2);
            }
        },
        collectionInteraction = function (userfunction) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return userfunction.apply(null, [collection].concat(args));
            };
        };



    (function (userinteraction) { // test 1
        setCollectionContent([
            {name: 'Arne Anderson'},
            {name: 'Berit Bertilson'},
            {brand: 'Volvo', licensePlate : 'BBB 222'},
        ]);

        userinteraction();

        expectCount(1, {name: 'Carl Carlson'});
        expectCount(1, {brand: 'Tesla', licensePlate : 'ABC 123'});
        expectCount(3, {name : {'$exists': true}});
        expectCount(2, {licensePlate : {'$exists': true}});
        expectCount(5, {});
    })(collectionInteraction(user.part1));

    (function (userinteraction) { // test 2

        var response,
            ids = [0,0].map(makePlate),
            expected = [{licensePlate:ids[0]},{licensePlate:ids[1]}];

        setCollectionContent([
            car('Honda',ids[0]),
            car('Honda',ids[1]),
            car('Volvo', makePlate()),
            car('Volvo', makePlate()),
            car('WW', makePlate()),
            car('WW', makePlate())]);

        response = userinteraction();

        if (!response || response.length !== 2) {
            throw "Failed test 2: Expected your function to return a array of length 2, but found \n" + JSON.stringify(response, null, 2);
        }

        if (!containsAll(expected, response, objectFlatMatch)) {
            throw "Failed test 2: Expected your function to return \n" + JSON.stringify(expected, null, 2) + ", but found \n" + JSON.stringify(response, null, 2);
        }
    })(collectionInteraction(user.part2));

    (function (userinteraction) {

        var lenghtArray = arrayOfLength(6),
            ageCounter = 20,
            checkAgainst = 9999,
            age = function (){
                var preIncrement = ageCounter;
                checkAgainst = preIncrement;
                ageCounter += Math.floor(Math.random() * 5 + 1);
                return preIncrement;
            },
            ages = lenghtArray.map(age);
        ages.sort(function() { return .5 - Math.random(); });

        var randomAges = fromNameAndAges(names(),ages),
            indexByAge = makeIndex(randomAges, function (a){return a.age;}, function (b){return b.name;});

        setCollectionContent(randomAges);

        response = userinteraction();

        checkInput(response,'your answer to test 3, <'+ JSON.stringify(response, 2, null) +'> ', {name:isValue(indexByAge[checkAgainst],"name of oldest person"), age:isValue(checkAgainst, "highest age")});

    })(collectionInteraction(user.part3));

    (function (userinteraction) {

        var nameTags = names();
        lenghtArray = arrayOfLength(nameTags.length),
        ageCounter = 26,
        checkAgainst = 0,
	      age = function (){
	          var preIncrement = ageCounter;
	          if (checkAgainst == 0 && ageCounter > 30) {
	              checkAgainst = preIncrement;
	          }
	          ageCounter += Math.floor(Math.random() * 4 + 1);
	          return preIncrement;
	      },
	      ages = lenghtArray.map(age);
        ages.sort(function() { return .5 - Math.random(); });

        var randomAges = fromNameAndAges(names(),ages),
            indexByAge = makeIndex(randomAges, function (a){return a.age;}, function (b){return b.name;});

        setCollectionContent(randomAges);

        response = userinteraction();

        checkInput(response,'your answer to test 4, <'+ JSON.stringify(response, null, 2) +'> ', {name:isValue(indexByAge[checkAgainst],"youngest older than 30"), age:isValue(checkAgainst, "youngest older than 30")});

    })(collectionInteraction(user.part4));

    checkInput(user,'parameter 1', {part5:isFunction});
    (function (userinteraction) {

        function increment(n){
            return n + 1;
        }

        var nameTags = names(),
	          ids = arrayOfLength(nameTags.length),
	          dataset = fromNameAndAtribute(nameTags, 'priority', ids);
        setCollectionContent(dataset);

        userinteraction();

        expectAll(fromNameAndAtribute(nameTags, 'priority', ids.map(increment)), {name:{'$exists':true}} );
        expectCount(nameTags.length, {name:{'$exists':true}});
    })(collectionInteraction(user.part5));

    print("All tests passed.");
};
