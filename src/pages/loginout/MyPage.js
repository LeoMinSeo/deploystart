import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainMenubar from "../../components/menu/MainMenubar";
import MyPageComponent from "../../components/member/MyPageComponent";
import { jwtDecode } from "jwt-decode";
import ProfileImageModal from "../../components/customModal/ProfileImageModal";
import {
  getProfile,
  updateProfileImage,
  deleteProfileImage,
} from "../../api/memberApi";

const MyPage = () => {
  const { userId } = useParams();
  const [data, setData] = useState("orders");
  const [userData, setUserData] = useState({});
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await getProfile(userId);
      setUserData(response);
    } catch (error) {
      console.error("프로필 정보 가져오기 실패:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const tokenUserId = decodedToken.userId;

      if (userId !== tokenUserId) {
        alert("접근 권한이 없습니다.");
        localStorage.clear();
        navigate("/");
        return;
      }
      fetchUserData();
    } catch (error) {
      console.error("토큰 검증 오류:", error);
      alert("인증 정보가 유효하지 않습니다.");
      localStorage.clear();
      navigate("/");
    }
  }, [userId, navigate]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleEditImage = () => {
    setIsModalOpen(false);
    document.getElementById("fileInput").click();
  };

  const handleDeleteImage = async () => {
    setLoading(true);
    try {
      await deleteProfileImage(userId);
      setNewProfileImage(null);
      fetchUserData();
      alert("프로필 이미지가 삭제되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 삭제 실패:", error);
      alert("프로필 이미지 삭제에 실패했습니다.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewProfileImage(URL.createObjectURL(file));
      uploadProfileImage(file);
    }
  };

  const uploadProfileImage = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      await updateProfileImage(userId, formData);
      fetchUserData();
      alert("프로필 이미지가 변경되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 업데이트 실패:", error);
      alert("프로필 이미지 변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const sidebar = [
    {
      id: "account",
      label: "이용 내역",
      items: [
        { id: "orders", label: "주문내역" },
        { id: "reservation", label: "예매내역" },
        { id: "reviews", label: "내 리뷰" },
      ],
    },
    {
      id: "finance",
      label: "포인트",
      items: [{ id: "point", label: "포인트 내역" }],
    },
    {
      id: "settings",
      label: "계정 관리",
      items: [
        { id: "settings", label: "내 정보 수정" },
        { id: "deleteMember", label: "회원탈퇴" },
      ],
    },
  ];

  // 현재 선택된 메뉴 찾기
  const getCurrentMenuLabel = () => {
    for (const category of sidebar) {
      for (const item of category.items) {
        if (item.id === data) {
          return item.label;
        }
      }
    }
    return "메뉴 선택";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <MainMenubar />
      
      {/* 모바일 마이페이지 헤더 - lg 미만에서만 표시 */}
      <div className="lg:hidden relative">
        <div className="bg-white shadow-sm border-b border-gray-200 mt-16 sm:mt-18 md:mt-20 sticky top-16 sm:top-18 md:top-20 z-30">
          <div className="px-4 py-2">
            {/* 마이페이지 제목 */}
            <h1 className="text-lg font-bold text-gray-800 mb-2">마이페이지</h1>
            
            {/* 프로필 정보와 햄버거 버튼 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {!userData.profileImagePath ? (
                    <div 
                      className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center cursor-pointer"
                      onClick={handleImageClick}
                    >
                      <svg className="w-5 h-5 text-gray-400" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="35" r="18" fill="currentColor" />
                        <path d="M25 90 L25 75 C25 55 75 55 75 75 L75 90 Z" fill="currentColor" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={
                        newProfileImage ||
                        `http://audimew.shop/api/member/profile-image/${
                          userData.profileImagePath
                        }?t=${new Date().getTime()}`
                      }
                      alt="프로필 사진"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 cursor-pointer"
                      onClick={handleImageClick}
                    />
                  )}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white"></div>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                    {userData.userName}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {userData.userEmail}
                  </p>
                </div>
              </div>
              
              {/* 햄버거 메뉴 버튼 - 오른쪽에 작게 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <span>{getCurrentMenuLabel()}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isMobileMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 - 전체 가로 길이로 */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-30">
            <div className="max-h-48 overflow-y-auto">
              {sidebar.map((category, categoryIndex) => (
                <div key={category.id}>
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                        data === item.id
                          ? "bg-orange-500 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setData(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex bg-gray-100 relative">
        {/* 데스크톱 사이드바 - 800px 고정 높이 */}
        <aside
          className="hidden lg:block absolute top-[120px] left-[2%] transition-all duration-1000 ease-in-out bg-white shadow-xl rounded-xl p-6 z-20 flex-shrink-0 
min-w-[450px] max-w-sm w-[2%] h-[800px]"
        >
          {/* 마이페이지 타이틀 */}
          <h2 className="text-3xl font-bold  mb-4 select-none text-center">
            마이페이지
          </h2>

          {/* 프로필 정보 섹션 */}
          <div className="flex flex-col items-center mb-8 border-b border-gray-200 pb-6">
            {/* 프로필 이미지 */}
            <div className="relative mb-4">
              {!userData.profileImagePath ? (
                <div
                  className="w-32 h-32 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center cursor-pointer shadow-sm"
                  onClick={handleImageClick}
                >
                  <svg
                    className="w-40 h-40 text-gray-400 -translate-y-1"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="50" cy="35" r="18" fill="currentColor" />
                    <path
                      d="M25 90 L25 75 C25 55 75 55 75 75 L75 90 Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              ) : (
                <img
                  src={
                    newProfileImage ||
                    `http://audimew.shop/api/member/profile-image/${
                      userData.profileImagePath
                    }?t=${new Date().getTime()}`
                  }
                  alt="프로필 사진"
                  className="w-32 h-32 rounded-full object-cover border-3 border-white shadow-sm cursor-pointer"
                  onClick={handleImageClick}
                />
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* 사용자 정보 */}
            <div className="text-center w-full">
              <h3 className="text-xl font-medium text-gray-800 mb-1">
                {userData.userName}
              </h3>
              <p className="text-sm text-gray-500 overflow-hidden text-ellipsis">
                {userData.userEmail}
              </p>
            </div>

            {/* 파일 input (보이지 않게 설정) */}
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <nav className="select-none space-y-4">
            {sidebar.map((category) => (
              <div key={category.id} className="mb-5">
                <h3 className="text-md uppercase tracking-wider font-semibold mb-3 pl-2">
                  {category.label}
                </h3>
                <ul className="border-l-2 border-gray-200">
                  {category.items.map((item) => (
                    <li key={item.id}>
                      <button
                        className={`w-full text-left pl-4 py-3 relative ${
                          data === item.id
                            ? "text-orange-500 font-medium border-l-2 border-orange-500 -ml-0.5"
                            : "hover:text-orange-500"
                        }`}
                        onClick={() => setData(item.id)}
                      >
                        {item.label}
                        {data === item.id && (
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-orange-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 - 고정값 기준 */}
        <main className="w-full lg:ml-[480px] lg:mr-[3vw] flex-grow bg-gray-100 px-0 py-0 lg:p-8 min-h-screen lg:mt-0 -mt-1">
          <MyPageComponent data={data} userId={userId} />
        </main>
      </div>

      <ProfileImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditImage}
        onDelete={handleDeleteImage}
      />
    </div>
  );
};

export default MyPage;