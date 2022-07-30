const email = document.querySelector("[name='email']");
const password = document.querySelector("[name='password']");
const loginBtn = document.querySelector('#login');
const errorText = document.querySelector('.error-input')
loginBtn.addEventListener('click', async (e) =>{
    e.preventDefault();
    try{
        const res = await axios.post('/login', 
        {
            email: email.value,
            password: password.value
        })
        if(res.status === 200){
            console.log(res)
            document.cookie = `chatify_token=${res.headers.authentication}`
            window.location.href = '/';
        }else{
            errorText.textContent = "authetication failed"
        }
    }catch(e){
        errorText.textContent = "authetication failed"
    }
    
    
    
    
})