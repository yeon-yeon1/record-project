import React from "react";
import { useForm } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      })
      .catch((error) => {
        alert(`이메일 혹은 비밀번호가 틀렸습니다. 다시 시도해 주세요.`);
      });
  };

  return (
    <div className="main">
      <h1 className="login">로그인</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="email" placeholder="이메일" {...register("email")} required />
        <input type="password" placeholder="비밀번호" {...register("password")} required />
        <button type="submit">로그인</button>
      </form>
      <div>
        <a className="signup" href="/signup">
          회원가입
        </a>
      </div>
    </div>
  );
};

export default Login;
