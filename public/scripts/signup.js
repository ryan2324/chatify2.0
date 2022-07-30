const form = document.querySelector('form');
const fName = document.querySelector("[name='first']");
const lName = document.querySelector("[name='last']");
const email = document.querySelector("[name='email']");
const password = document.querySelector("[name='password']");
const signupBtn = document.querySelector('#signup');
const emailErrorText = document.querySelector('.email-error-input');
const passwordErrorText = document.querySelector('.password-error-input');
const nameErrorText = document.querySelector('.name-error-input')
const errorInput = {
    name: '',
    email: '',
    password: ''
}
signupBtn.addEventListener('click', async (e) =>{
    e.preventDefault();
    let pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/; 
    if(fName.value.length < 1){
        errorInput.name = 'name cannot be empty'
    }else{
        errorInput.name = '';
    }
    if(lName.value.length < 1){
        errorInput.name = 'name cannot be empty'
    }else{
        errorInput.name = '';
    }
    if(!email.value.match(pattern)){
        errorInput.email = 'please enter valid email';
    }else{
        errorInput.email = '';
    }
    if(password.value.length < 8){
        errorInput.password = 'password must be 8 characters long';
    }else{
        errorInput.password = '';
    }
    nameErrorText.textContent = errorInput.name;
    emailErrorText.textContent = errorInput.email;
    passwordErrorText.textContent = errorInput.password;
    if(errorInput.email.length === 0 && errorInput.password.length === 0 && errorInput.name.length === 0){
        const res = await axios.post('/signup', 
        {
            name: `${fName.value} ${lName.value}`,
            email: email.value,
            password: password.value
        })
        if(!res.data.status){
            errorInput.email = 'email already exist';
            emailErrorText.textContent = errorInput.email;
            return
        }
        window.location.href = '/login'
        console.log('approve')
    }
    
})