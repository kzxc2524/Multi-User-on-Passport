const bcrypt = require('bcrypt');
const saltRounds = 10; //공격자의 속도를 떨어뜨리는 값 높을수록 오래걸리게 만듦
const myPlaintextPassword = '12345678';
const someOtherPlaintextPassword = '12345679';

bcrypt.hash(myPlaintextPassword, saltRounds, function (err, hash) {
    console.log(hash); //DB에 저장할 값
    bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
        console.log('myPlaintextPassword ' + result);
    });
    bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
        console.log('someOtherPlaintextPassword ' + result);
    });
});