import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { auth } from "../firebase"; // Firebase 설정 파일을 정확히 불러오는지 확인
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (data) => {
    setLoading(true);
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        setLoading(false);
        navigate("/"); // 회원가입 후 이동할 페이지를 정확히 설정
      })
      .catch((error) => {
        setLoading(false);
        // 정확한 에러 메시지를 확인하고 사용자에게 알림
        console.error("회원가입 에러:", error.message);
        alert(`회원가입 중 에러가 발생했습니다: ${error.message}`);
      });
  };

  return (
    <div className="main">
      <h1 className="sign_up">회원가입</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="email"
          placeholder="이메일"
          {...register("email", {
            required: "이메일을 입력하세요.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "유효한 이메일 주소를 입력하세요.",
            },
          })}
        />
        {errors.email && <p>{errors.email.message}</p>}

        <input
          type="password"
          placeholder="비밀번호(6자리 이상)"
          {...register("password", {
            required: "비밀번호를 입력하세요.",
            minLength: {
              value: 6,
              message: "비밀번호는 최소 6자리여야 합니다.",
            },
          })}
        />
        {errors.password && <p>{errors.password.message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "처리 중..." : "회원가입"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
