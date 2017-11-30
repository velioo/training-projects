<!-- <script> !-->
// Numbers Range - Max safe integers
var a = 2 ** 53 - 1;
var b = -(2**53) + 1;
console.log("1: a = 2**53 - 1", a);
console.log("1: b = -(2**53) + 1", b);
a++;
b--;
console.log("2: a = a + 1", a);
console.log("2: b = b - 1", b);
a++;
b--;
console.log("3: a = a + 1", a);
console.log("3: b = b - 1", b);
a++;
b--;
console.log("4: a = a + 1", a);
console.log("4: b = b - 1", b);
a+=2;
b-=2;
console.log("5: a = a + 2", a);
console.log("5: b = b - 2", b);
a++;
b--;
console.log("6: a = a + 1", a);
console.log("6: b = b - 1", b);
a-=1;
b+=1;
console.log("5: a = a - 1", a);
console.log("5: b = b + 1", b);
// Numbers - Max value
var a = 5;
console.log("Decimal a = ", a);
var a = 0b101;
console.log("Binary a = ", a);
var a = 0o5;
console.log("Octal a = ", a);
var a = 0x5;
console.log("Hexadecimal a = ", a);
console.log("Numbers - Going over the max value");
// Numbers - Going over the max value
a = Number.MAX_VALUE;
console.log("a = MAX_VALUE", a);
a = a + 1;
console.log("MAX_VALUE + 1", a);
a = a * 2;
console.log("MAX_VALUE * 2", a);
a = a / 0;
console.log("MAX_VALUE / 0", a);
console.log("Numbers - Going over the min value");
a = Number.MIN_VALUE;
console.log("a = MIN_VALUE", a);
a = a / 999999;
console.log("a / 999999", a);
a = a + 1;
console.log("a + 1", a);
a = 2 / (2555555555555555555555555555555555555555555555555555555555555555555 ** 2222222222222222222222222222222222222);
console.log("2 / (213123... ** 22222...)", a);
console.log("Numbers - Special values");
a = Infinity + 1;
console.log("Infinity + 1", a);
a = Infinity / Infinity;
console.log("Infinity / Infinity = ", a);
a = 1 / Infinity;
console.log("1 / Infinity = ", a);
a = 1 + NaN;
console.log("1 + NaN", a);
a = 1 / NaN;
console.log("1 / NaN", a);
a = NaN + NaN;
console.log("NaN + NaN",a);
a = NaN + Infinity;
console.log("NaN + Infinity",a);
a = 0 * Infinity;
console.log("0 * Infinity",a);
a = Infinity / NaN;
console.log("Infinity / NaN",a);
a = 2 + "2";
console.log("2 + \"2\"", typeof a, a);
a = 5 - '3';
console.log("5 - \"3\"", typeof a, a);
a = 5 * '3';
console.log("5 * \"3\"", typeof a, a);
a = 5 / '3';
console.log("5 / \"3\"", typeof a, a);
a = 2.0 + 1;
console.log("2.0 + 1", typeof a, a);
a = 2.1 + 1;
console.log("2.1 + 1", typeof a, a);
a = +'1' + +'2';
console.log("+'1' + +'2'", a);


// Strings
console.log("----------Strings----------")
a = "1";
console.log("a = '1'")
console.log("Before test(a) a =", a);
test(a);
function test(a) {
	console.log("Before changing a =", a);
	if (Array.isArray(a)) {
		a[0] = "Changed"
	} else {
		a[0] = "2";
	}
	console.log("Affter changing a =", a);
}
console.log("After test(a) a =", a);
a = 'hello';
console.log("a =", a);
var b = a;
console.log("a = b =", b);
a = 'bye';
console.log("a =", a);
console.log("b =", b);
a[0] = "m";
console.log("a[0] = 'm': a =", a);
var s_prim = 'foo';
var s_obj = new String(s_prim);
console.log("Typeof s_prim = ", typeof s_prim);
console.log("Typeof s_obj = ", typeof s_obj);
console.log("中文 español deutsch English हिन्दी العربية português বাংলা русский 日本語 ਪੰਜਾਬੀ 한국어 தமிழ் עברית");
console.log("\u5c07\u63a2\u8a0e HTML5 \u53ca\u5176\u4ed6🐄");
a = "fee fi fea fo fum";
console.log("a =", a);
var re = /(f[i|e][^\s]*)/g;
console.log('Regex = /(f[i|e][^\s]*)/g')
console.log("a.match = ", a.match(re));
console.log("re.test = ", re.test(a));
console.log("a.search = ", a.search(re));
re = /(f[i|e][^\s]*)/g;
var match;
while((match = re.exec(a)) != null) {
	console.log("re.exec: Index: ", match.index);
}
b = a.replace(re, 'fly');
console.log("Replaced string with regex g mod:", b);
re = /(f[i|e][^\s]*)/;
b = a.replace(re, 'fly');
console.log("Replaced string with regex:", b);
b = a.replace('fe', 'bo');
console.log("Replaced string without regex:", b);
//Arrays
console.log("Arrays");
var arr = [1, 2, "hello", {"name": "There"}, 5];
console.log("arr = ", arr);
arr.push("pushed element");
arr.unshift("unshifted element");
console.log(arr);
a = arr.pop();
b = arr.shift();
console.log("Before test(a): arr =", arr);
test(arr);
console.log("After test(a): arr =", arr);
console.log("arr =", arr);
var arr_copy = arr;
console.log("arr_copy = arr =", arr);
arr.push("new_element");
console.log("arr.push('new_element')");
console.log("arr_copy =", arr_copy);
arr_copy = arr.slice();
console.log("arr_copy = arr.slice()");
console.log("arr_copy =", arr_copy);
arr.push("new_element2");
console.log("arr_push('new_element2')");
console.log("arr_copy =", arr_copy);
//Objects
var myObj = new Object(),
    str = 'myString',
    rand = Math.random(),
    obj = new Object();

myObj.type              = 'Dot syntax';
myObj['date created']   = 'String with space';
myObj[str]              = 'String value';
myObj[rand]             = 'Random Number';
myObj[obj]              = 'Object';
myObj['']               = 'Even an empty string';
console.log("Before test2(obj): myObj =", myObj);
function test2(obj) {
	//obj = {'type': 'new_type'};
	obj['type'] = 'new type';
	obj = {'type': 'new_type'};
}
test2(myObj);
console.log("After test2(obj): myObj =", myObj);
<!--</script> !-->
