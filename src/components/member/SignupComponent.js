import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, checkId } from "../../api/memberApi";
import AddressSearch from "../customModal/AddressSearch";

// utils 함수들
const formatPhoneNumber = (value) => {
  if (!value) return "";

  const numbers = value.replace(/[^\d]/g, "");

  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  }
};

const validatePhoneNumber = (number) => {
  if (!number) {
    return { isValid: true, message: "" };
  }

  const validLength = number.length >= 11 && number.length <= 11;

  if (!validLength) {
    return { isValid: false, message: "유효하지 않은 휴대폰 번호입니다." };
  } else {
    return { isValid: true, message: "" };
  }
};

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

const SignUpComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    confirmPassword: "",
    userName: "",
    userEmail: "",
    userEmailId: "",
    userEmailDomain: "",
    userAddress: "",
    userPhoneNum: "",
    agreeAge: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeComercial: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [idChecked, setIdChecked] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState(false);
  const [formattedPhone, setFormattedPhone] = useState("010");
  const [phoneError, setPhoneError] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 휴대폰 번호 처리 로직
    if (name === "userPhoneNum") {
      // 값이 비어있지 않은 경우에만 처리
      if (value) {
        let onlyDigits = value.replace(/[^\d]/g, "").slice(0, 11);

        // 입력값이 비어있거나 '010'으로 시작하지 않으면 '010' 설정
        if (!onlyDigits || !onlyDigits.startsWith("010")) {
          onlyDigits = "010";
        }

        const formatted = formatPhoneNumber(onlyDigits);
        const validation = validatePhoneNumber(onlyDigits);

        setFormattedPhone(formatted);
        setPhoneError(validation.message);

        setFormData((prevState) => ({
          ...prevState,
          userPhoneNum: formatted,
        }));
      } else {
        // 입력값이 완전히 비어있는 경우 기본값 설정
        setFormattedPhone("010");
        setPhoneError("");
        setFormData((prevState) => ({
          ...prevState,
          userPhoneNum: "010",
        }));
      }
      return;
    }

    setFormData((prevState) => {
      const newState = {
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "userPw") {
        setPasswordValid(passwordRegex.test(value));
        setPasswordMatch(value === prevState.confirmPassword);
      } else if (name === "confirmPassword") {
        setPasswordMatch(value === prevState.userPw);
      }

      if (name === "userId") {
        setIdChecked(false);
      }

      // 이메일 조합 로직
      if (name === "userEmailDomain") {
        newState.userEmail = prevState.userEmailId
          ? `${prevState.userEmailId}@${value}`
          : "";
      } else if (name === "userEmailId") {
        newState.userEmail = prevState.userEmailDomain
          ? `${value}@${prevState.userEmailDomain}`
          : "";
      }

      return newState;
    });
  };

  // 주소 검색에서 주소가 선택됐을 때 호출될 함수
  const handleAddressSelect = (address, zonecode) => {
    setFormData((prevState) => ({
      ...prevState,
      userAddress: address,
    }));
  };

  const handleUserIdCheck = async () => {
    if (!formData.userId || formData.userId.trim() == "") {
      alert("아이디를 입력해주세요.");
      return;
    }

    const result = await checkId(formData.userId);

    if (result.success) {
      alert("아이디가 사용 가능합니다.");
      setIdChecked(true);
    } else {
      alert("아이디가 중복되었습니다. 다른 아이디를 사용해주세요.");
      setFormData((prevState) => ({
        ...prevState,
        userId: "",
      }));
      setIdChecked(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setFormData((prevState) => ({
      ...prevState,
      agreeAge: isChecked,
      agreeTerms: isChecked,
      agreePrivacy: isChecked,
      agreeComercial: isChecked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idChecked) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }

    if (!formData.userPw || formData.userPw.trim() === "") {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordValid) {
      alert(
        "비밀번호는 6글자 이상, 영어(대소문자 구분 없음), 숫자, 특수문자가 포함되어야 합니다."
      );
      return;
    }

    if (!passwordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!formData.userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!formData.userAddress.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }

    if (!formData.userEmailId || formData.userEmailId.trim() === "") {
      alert("이메일을 제대로 입력해주세요.");
      return;
    }

    if (!formData.userEmailDomain || formData.userEmailDomain.trim() === "") {
      alert("이메일 도메인을 제대로 입력해주세요.");
      return;
    }

    if (formData.userPhoneNum.length < 13) {
      alert("휴대폰 번호가 제대로 입력되지 않았습니다.");
      return;
    }

    if (!formData.agreeAge || !formData.agreeTerms || !formData.agreePrivacy) {
      alert("필수 약관에 동의해야 합니다.");
      return;
    }

    setIsSubmitting(true);
    console.log("유저아이디" + formData.userId);
    const filteredData = {
      userId: formData.userId.trim(),
      userPw: formData.userPw,
      userName: formData.userName.trim(),
      userEmail: formData.userEmail.trim(),
      userEmailId: formData.userEmailId.trim(),
      userEmailDomain: formData.userEmailDomain.trim(),
      userAddress: formData.userAddress.trim(),
      userPhoneNum: formData.userPhoneNum,
    };

    const result = await registerUser(filteredData);

    if (result && result.success === true) {
      alert("회원가입이 완료되었습니다!");
      navigate("/member/login");
      window.location.reload();
    } else {
      setError(
        result?.message || "회원가입에 실패했습니다. 다시 시도해 주세요."
      );
    }

    setIsSubmitting(false);
  };

  // 컴포넌트 마운트 시 초기값 설정
  useEffect(() => {
    if (formData.userPhoneNum) {
      setFormattedPhone(formatPhoneNumber(formData.userPhoneNum));
    }
  }, []);

  return (
    <>
      {error && (
        <div className="text-red-500 text-sm mb-1 text-center">{error}</div>
      )}

      {/* UserIdInput 컴포넌트 */}
      <div className="relative w-full my-2 flex items-center">
        <i className="bx bxs-user absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
        <input
          type="text"
          name="userId"
          placeholder="아이디를 입력해주세요"
          value={formData.userId}
          onChange={handleChange}
          className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400 flex-grow"
        />
        <button
          type="button"
          onClick={handleUserIdCheck}
          className="ml-2 py-2.5 px-1 bg-orange-400 text-xs text-white rounded-md border-none outline-none w-20 h-10 flex items-center justify-center"
        >
          중복 확인
        </button>
      </div>

      {/* PasswordInput 컴포넌트 */}
      <div className="relative w-full my-2">
        <i className="bx bxs-lock-alt absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
        <input
          type={showPassword ? "text" : "password"}
          name="userPw"
          placeholder="비밀번호를 입력해주세요"
          value={formData.userPw}
          onChange={handleChange}
          className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400"
        />
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={togglePasswordVisibility}
        >
          <img
            src={showPassword ? "/images/showPw.png" : "/images/hidePw.png"}
            alt="아이콘"
            width="24"
            height="24"
          />
        </span>
      </div>
      {!passwordValid && formData.userPw && (
        <div className="text-xs text-red-600 mb-2 text-start pl-1">
          영문, 특수문자, 숫자를 모두 포함해야 하며 6글자 이상입니다.
        </div>
      )}

      <div className="relative w-full my-2">
        <i className="bx bxs-lock-alt absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="비밀번호를 재입력해주세요"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400"
        />
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
          onClick={toggleConfirmPasswordVisibility}
        >
          <img
            src={
              showConfirmPassword ? "/images/showPw.png" : "/images/hidePw.png"
            }
            alt="아이콘"
            width="24"
            height="24"
          />
        </span>
      </div>
      {formData.confirmPassword && (
        <div
          className={`text-xs mb-2 text-start pl-1 ${
            passwordMatch ? "text-green-600" : "text-red-600"
          }`}
        >
          {passwordMatch
            ? "비밀번호가 일치합니다."
            : "비밀번호가 일치하지 않습니다."}
        </div>
      )}

      {/* ProfileInputs 컴포넌트 */}
      <div className="mb-2">
        <div className="mb-2">
          <div className="relative w-full my-2">
            <i className="bx bxs-user absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="이름을 입력해주세요"
              className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400"
            />
          </div>
        </div>

        <div className="relative w-full my-2 flex items-center">
          <i className="bx bxs-map absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
          <input
            type="text"
            name="userAddress"
            value={formData.userAddress}
            onChange={handleChange}
            placeholder="주소를 검색해주세요"
            className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none flex-grow"
            readOnly
          />
          <button
            type="button"
            onClick={() => setIsAddressModalOpen(true)}
            className="ml-2 py-2.5 px-1 bg-orange-400 text-xs text-white rounded-md border-none outline-none w-20 h-10 flex items-center justify-center"
          >
            주소 찾기
          </button>
        </div>
      </div>

      {/* EmailInput 컴포넌트 */}
      <div className="relative w-full my-2">
        <i className="bx bxs-envelope absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
        <div className="flex w-full items-center">
          <input
            type="text"
            name="userEmailId"
            placeholder="이메일 아이디"
            value={formData.userEmailId}
            onChange={handleChange}
            className="pl-2 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400 w-2/5 mr-1"
          />
          <span className="mx-1">@</span>

          {customDomainInput ? (
            <input
              type="text"
              name="userEmailDomain"
              placeholder="도메인 입력"
              value={formData.userEmailDomain}
              onChange={(e) =>
                handleChange({
                  target: { name: "userEmailDomain", value: e.target.value },
                })
              }
              className="pl-2 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400 w-2/5"
            />
          ) : (
            <input
              type="text"
              name="userEmailDomain"
              placeholder="도메인 선택"
              value={formData.userEmailDomain}
              readOnly
              className="pl-2 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none w-2/5"
            />
          )}

          <div className="ml-1 w-1/5">
            <select
              name="userEmailDomain"
              value={customDomainInput ? "custom" : formData.userEmailDomain}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setCustomDomainInput(true);
                  handleChange({
                    target: { name: "userEmailDomain", value: "" },
                  });
                } else {
                  setCustomDomainInput(false);
                  handleChange(e);
                }
              }}
              className="w-full border border-gray-100 rounded-md py-2.5 px-1 bg-gray-100 text-sm"
            >
              <option value="">선택</option>
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="custom">직접 입력</option>
            </select>
          </div>
        </div>

        <input
          type="email"
          name="userEmail"
          value={formData.userEmail}
          readOnly
          className="hidden"
        />
      </div>

      {/* PhoneInput 컴포넌트 */}
      <div className="relative w-full my-2">
        <i className="bx bxs-phone absolute top-1/2 left-4 transform -translate-y-1/2 text-xl text-gray-500"></i>
        <input
          type="text"
          name="userPhoneNum"
          value={isFocused || formattedPhone !== "010" ? formattedPhone : ""}
          onChange={handleChange}
          className="w-full pl-10 py-2.5 text-sm bg-gray-100 rounded-md border border-white outline-none focus:border-orange-400"
          placeholder={!isFocused ? "휴대폰 번호를 입력해주세요(-제외)" : ""}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
      <div className="text-start">
        {formattedPhone && (
          <div className="text-red-600 text-xs mt-1 ml-1">{phoneError}</div>
        )}
      </div>

      {/* AgreementSection 컴포넌트 */}
      <div className="my-4 text-left">
        <div className="mb-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={
                formData.agreeAge &&
                formData.agreeTerms &&
                formData.agreePrivacy &&
                formData.agreeComercial
              }
              onChange={handleCheckAll}
              className="mr-2"
            />
            <span className="text-sm">전체 동의</span>
          </label>
        </div>
        <div className="mb-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeAge"
              checked={formData.agreeAge}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">(필수) 만 14세 이상 입니다.</span>
          </label>
        </div>
        <div className="mb-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">(필수) 이용약관 동의</span>
          </label>
        </div>
        <div className="mb-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={formData.agreePrivacy}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">(필수) 개인정보 처리방침 동의</span>
          </label>
        </div>
        <div className="mb-1">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="agreeComercial"
              checked={formData.agreeComercial}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm">(선택) 마케팅 정보 수신 동의</span>
          </label>
        </div>
      </div>

      {/* AddressSearch 컴포넌트 */}
      <AddressSearch
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onAddressSelect={handleAddressSelect}
      />

      {/* 회원가입 버튼 */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-2 px-8 bg-orange-400 text-base text-white rounded-md border-none outline-none cursor-pointer mt-2"
      >
        가입완료
      </button>
    </>
  );
};

export default SignUpComponent;
