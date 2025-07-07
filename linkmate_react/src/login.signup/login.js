import { useFormStatus } from "react-dom";
import axios from 'axios';
import logo from '../logo.png'
import ServerLink from "../serverLink";


function googleAuth() {
    window.location.href = ServerLink("/auth/google");
}

async function login(formData) {
    let email = formData.get('email');
    let pass = formData.get('pass');
    console.log(email);
    // const navigate = useNavigate();

    const response = await axios.post(
        ServerLink("/login"), 
        {email, pass}, 
        {withCredentials: true}
    );
    if(response.data.success) window.location.href = "/linkpreview?u=" + response.data.userId;
    else if(response.data.gmail) alert("Sign in with google!");
    else if(response.data.passFail) alert("Incorrect password, try again!");
    else alert("Problem occured, try again!");

}

function LoginForm(){
    const { pending } =  useFormStatus();
    return(
        <div className='main'>
            <img src={logo} alt='LinkMake Logo' />
            <form action={login}>
                <input type='email' name="email" placeholder='Email' required />
                <input type='password' name="pass" placeholder='Password' required />
                <button type='submit' disabled={pending} > {!pending ? 'Login': 'Logging in...'} </button>
            </form>
            <hr />
            <button onClick={googleAuth}>
                <i className="fab fa-google"></i>
                Continue with Google
            </button> <br /><br />
            <a href="/signup" className="aLink">Create Account</a>
        </div>
    );
}

export default LoginForm;