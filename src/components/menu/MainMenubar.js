import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MainMenubar = ({ currentIndex, currentPage }) => {
  let loginUser = {};

  try {
    const storedUser = localStorage.getItem("user");
    loginUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("JSON 파싱 오류:", error);
    loginUser = {}; // 예외 발생 시 기본 값 할당
  }

  const [user, setUser] = useState(loginUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setUser(loginUser);
  }, []);

  const handleLogout = async () => {
    const res = await axios.post(`https://audimew.shop/api/auth/logout`, {
      refreshToken: localStorage.getItem("refreshToken"),
    });
   
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");

    navigate(currentPage ? currentPage : "/");
  };

  const handleMyPage = () => {
    if (!loginUser) {
      navigate("/member/login", { state: { from: location.pathname } });
    } else {
      navigate(`/member/mypage/${loginUser.userId}`);
    }
  };

  const handleBasketPage = () => {
    if (loginUser) {
      navigate("/shopping/basket");
    } else {
      navigate("/member/login", { state: { from: location.pathname } });
    }
  };

  const handleAdmin = () => {
    navigate("/admin");
  };

  return (
    <>
      {/* 데스크톱 메뉴바 */}
      <div
        className={`absolute top-0 left-0 w-full h-16 sm:h-18 md:h-20 lg:h-[10vh] z-50 flex items-center px-3 sm:px-5 transition-all duration-500 ${
          currentIndex === 0
            ? "bg-transparent"
            : currentIndex === 3
            ? "bg-white"
            : "bg-[#f1efeb]"
        }`}
      >
        {/* 로고 */}
        <div className="flex-shrink-0">
          <Link
            to={"/"}
            className={`${
              currentIndex === 0
                ? "text-[#EED9C4] font-bold"
                : "text-black font-bold"
            }`}
          >
            <img
              src={`${
                currentIndex === 0
                  ? "/images/1stpageLogo.png"
                  : "/images/mainlogo.png"
              }`}
              className={`${
                currentIndex === 0 
                  ? "w-20 sm:w-24 md:w-28 lg:w-32" 
                  : "w-12 sm:w-16 md:w-18 lg:w-20"
              }`}
              alt="logo"
            />
          </Link>
        </div>

        {/* 데스크톱 네비게이션 - lg 이상에서만 표시 */}
        <div className="hidden lg:flex lg:items-center lg:ml-4 lg:space-x-6">
          <Link
            to={{ pathname: "/product", state: loginUser }}
            className={`${
              currentIndex === 0
                ? "text-[#EED9C4] font-bold"
                : "text-black font-bold"
            } whitespace-nowrap`}
          >
            product shop
          </Link>
          <Link
            to={{ pathname: "/reservation", state: loginUser }}
            className={`${
              currentIndex === 0
                ? "text-[#EED9C4] font-bold"
                : "text-black font-bold"
            } whitespace-nowrap`}
          >
            reservation
          </Link>
        </div>

        {/* 햄버거 메뉴 버튼 - lg 미만에서만 표시 */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden ml-auto mr-4 p-2 ${
            currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* 데스크톱 사용자 메뉴 - lg 이상에서만 표시 */}
        <div className="hidden lg:flex lg:items-center lg:ml-auto lg:mr-5 lg:space-x-4">
          {loginUser ? (
            <>
              <button
                onClick={handleLogout}
                className={`${
                  currentIndex === 0
                    ? "text-[#EED9C4] font-bold"
                    : "text-black font-bold"
                } whitespace-nowrap`}
              >
                LogOut
              </button>

              {loginUser.userId === "admin" ? (
                <button
                  onClick={handleAdmin}
                  className={`${
                    currentIndex === 0
                      ? "text-[#EED9C4] font-bold"
                      : "text-black font-bold"
                  } whitespace-nowrap`}
                >
                  Administrator
                </button>
              ) : (
                <Link
                  to={`/member/mypage/${loginUser.userId}`}
                  className={`${
                    currentIndex === 0
                      ? "text-[#EED9C4] font-bold"
                      : "text-black font-bold"
                  } whitespace-nowrap`}
                >
                  MyPage
                </Link>
              )}

              {loginUser.userId !== "admin" && (
                <button
                  onClick={handleBasketPage}
                  className={`${
                    currentIndex === 0
                      ? "text-[#EED9C4] font-bold"
                      : "text-black font-bold"
                  } whitespace-nowrap`}
                >
                  Cart
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/member/login", {
                    state: { from: location.pathname },
                  });
                }}
                className={`${
                  currentIndex === 0
                    ? "text-[#EED9C4] font-bold"
                    : "text-black font-bold"
                } whitespace-nowrap`}
              >
                Login
              </button>
              <button
                onClick={handleMyPage}
                className={`${
                  currentIndex === 0
                    ? "text-[#EED9C4] font-bold"
                    : "text-black font-bold"
                } whitespace-nowrap`}
              >
                MyPage
              </button>
              <button
                onClick={handleBasketPage}
                className={`${
                  currentIndex === 0
                    ? "text-[#EED9C4] font-bold"
                    : "text-black font-bold"
                } whitespace-nowrap`}
              >
                Cart
              </button>
            </>
          )}
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-16 sm:top-18 md:top-20 left-0 w-full z-40 ${
          currentIndex === 0 
            ? "bg-transparent" 
            : "bg-white shadow-lg"
        }`}>
          <div className="px-4 py-2 space-y-3">
            {/* 네비게이션 링크 */}
            <Link
              to={{ pathname: "/product", state: loginUser }}
              className={`block py-2 ${
                currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
              } font-bold`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              product shop
            </Link>
            <Link
              to={{ pathname: "/reservation", state: loginUser }}
              className={`block py-2 ${
                currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
              } font-bold`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              reservation
            </Link>

            {/* 사용자 메뉴 */}
            <hr className={`my-2 ${currentIndex === 0 ? "border-[#EED9C4]" : "border-gray-300"}`} />
            
            {loginUser ? (
              <>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2 ${
                    currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                  } font-bold`}
                >
                  LogOut
                </button>

                {loginUser.userId === "admin" ? (
                  <button
                    onClick={() => {
                      handleAdmin();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 ${
                      currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                    } font-bold`}
                  >
                    Administrator
                  </button>
                ) : (
                  <Link
                    to={`/member/mypage/${loginUser.userId}`}
                    className={`block py-2 ${
                      currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                    } font-bold`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    MyPage
                  </Link>
                )}

                {loginUser.userId !== "admin" && (
                  <button
                    onClick={() => {
                      handleBasketPage();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left py-2 ${
                      currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                    } font-bold`}
                  >
                    Cart
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/member/login", {
                      state: { from: location.pathname },
                    });
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2 ${
                    currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                  } font-bold`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    handleMyPage();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2 ${
                    currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                  } font-bold`}
                >
                  MyPage
                </button>
                <button
                  onClick={() => {
                    handleBasketPage();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left py-2 ${
                    currentIndex === 0 ? "text-[#EED9C4]" : "text-black"
                  } font-bold`}
                >
                  Cart
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MainMenubar;