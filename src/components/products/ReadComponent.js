import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOne } from "../../api/productsApi";
import ReviewComponent from "../menu/ReviewComponent";
import { addCart } from "../../api/userApi";
import ResultModal from "../common/ResultModal";
import MainMenubar from "../menu/MainMenubar";

const init = [
  {
    productDTO: {},
    reviewRatingDTO: {},
  },
];

const ReadComponent = () => {
  const loginUser = JSON.parse(localStorage.getItem("user"));
  const pno = useParams();
  const navigate = useNavigate();
  const [returnMsg, setReturnMsg] = useState(null);
  const [product, setProduct] = useState(init);
  const [fetching, setFetching] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // 수량 증가/감소 함수
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // 상품 정보 불러오기
  useEffect(() => {
    getOne(pno).then((data) => {
      setProduct(data);
      setFetching(false);
     
      if (data.productDTO.deleted === true) {
        alert("삭제된 상품입니다.");
        navigate("/product/list");
        return;
      }
      if (data.productDTO.pstock <= 0) {
        alert("SoldOut 상품입니다.");
        navigate("/product/list");
      }
    });
  }, [pno]);

  // FormData 객체
  const formDataRef = useRef(new FormData());

  // 사용자 정보 및 상품, 수량 설정
  useEffect(() => {
    // 로그인한 사용자라면, 그 ID를 사용
    if (loginUser) {
      formDataRef.current.set("userId", loginUser.userId);
      formDataRef.current.set("pNo", pno.pno);
      formDataRef.current.set("numOfItem", quantity);
    }
  }, [pno, quantity, loginUser]);

  // 장바구니에 상품 추가
  const clickSubmit = () => {
    // 로그인한 경우
    if (loginUser) {
      addCart(formDataRef.current).then((data) => {
        setReturnMsg(data);
        setQuantity(1);
      });
    } else {
      // 비회원인 경우
      alert("로그인 후 이용해 주십시오.");
      navigate("/member/login", { state: { from: location.pathname } });
    }
  };

  // 바로구매 기능
  const handleDirectPurchase = () => {
    // 로그인한 경우에만 바로구매 가능
    if (loginUser) {
      // 바로구매용 데이터 구성
      const directPurchaseData = [
        {
          cartNo: `direct_${Date.now()}`, // 임시 카트번호 (실제 DB에 저장되지 않음)
          userDTO: {
            userId: loginUser.userId,
            userName: loginUser.userName || "",
            userEmail: loginUser.userEmail || "",
            userAddress: loginUser.userAddress || "",
            userPhoneNum: loginUser.userPhoneNum || "",
            uid: loginUser.uid || null,
          },
          productDTO: product.productDTO,
          numofItem: quantity,
        },
      ];

      // 가격 계산 (숫자만 추출)
      const price = product.productDTO.price.replace(/[^0-9]/g, "");
      const priceNumber = parseInt(price);
      if (isNaN(priceNumber)) {
        alert("상품 가격 정보가 올바르지 않습니다.");
        return;
      }

      // 총 가격 계산 및 포맷팅
      const totalPrice = priceNumber * quantity;
      const formattedTotalPrice = new Intl.NumberFormat().format(totalPrice);

      // 페이먼트 페이지로 이동 (direct=true 파라미터 추가)
      navigate(
        `/shopping/payment?totalPrice=${formattedTotalPrice}&cartData=${encodeURIComponent(
          JSON.stringify(directPurchaseData)
        )}&direct=true`
      );
    } else {
      // 비회원인 경우
      alert("로그인 후 이용해 주십시오.");
      navigate("/member/login", { state: { from: location.pathname } });
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setReturnMsg(null);
  };

return (
    <div className="min-h-screen p-6">
      {returnMsg ? (
        <ResultModal content={returnMsg} callbackFn={closeModal} />
      ) : (
        <></>
      )}
      <MainMenubar currentPage={`/product/read/${pno.pno}`} />
      
      {fetching ? (
        <div className="text-center text-2xl font-bold">로딩 중...</div>
      ) : (
        <>
          {/* 데스크톱 레이아웃 (기존 유지) - lg 이상에서만 표시 */}
          <section className="hidden lg:block bg-white p-6 border border-[#ad9e87] border-opacity-30 rounded-lg mt-16 sm:mt-18 md:mt-20 lg:mt-28 w-full lg:w-2/3 mx-auto">
            <div className="flex flex-row justify-between">
              {/* 왼쪽: 상품 이미지 */}
              <div className="w-1/3 h-auto bg-white p-6 rounded-lg relative overflow-hidden">
                <img
                  src={
                    product.productDTO.uploadFileNames.length > 0
                      ? `https://audimew.shop/api/product/view/${product.productDTO.uploadFileNames[0]}`
                      : "/images/defalt.png"
                  }
                  alt="상품 이미지"
                  className="h-auto rounded-md mx-auto p-6"
                />
              </div>

              {/* 오른쪽: 상품 정보 */}
              <div className="w-2/3 h-auto text-left ml-4 flex flex-col">
                <h2 className="text-2xl font-bold">{product.productDTO.pname}</h2>
                <p className="mt-2 text-xl font-bold text-red-600">
                  {product.productDTO.price}
                </p>

                {/* 간단설명 */}
                <div className="mt-4 p-3 border rounded-lg">
                  <p className="font-bold">상품설명</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {product.productDTO.pdesc}
                  </p>
                </div>

                {/* 상품 옵션 선택 */}
                <div className="mt-4 ml-auto">
                  <label className="block font-bold">
                    상품의 수량을 선택하세요
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      className="px-3 py-2 border rounded-lg text-lg ml-auto"
                      onClick={decreaseQuantity}
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      className="px-3 py-2 border rounded-lg text-lg"
                      onClick={increaseQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 장바구니 & 바로구매 버튼 */}
                <div className="mt-12 flex gap-2">
                  <button
                    className="w-1/2 p-3 bg-[#ad9e87] text-white rounded-lg"
                    onClick={clickSubmit}
                  >
                    장바구니
                  </button>
                  <button
                    className="w-1/2 p-3 bg-[#ad9e87] text-white rounded-lg"
                    onClick={handleDirectPurchase}
                  >
                    바로구매
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 모바일/태블릿 레이아웃 - lg 미만에서 표시 */}
          <div className="lg:hidden mt-16 sm:mt-18">
            {/* 상품 이미지 섹션 */}
            <div className="bg-white rounded-lg mb-4 overflow-hidden shadow-sm">
              <div className="w-full h-64 sm:h-80 bg-gray-50">
                <img
                  src={
                    product.productDTO.uploadFileNames.length > 0
                      ? `https://audimew.shop/api/product/view/${product.productDTO.uploadFileNames[0]}`
                      : "/images/defalt.png"
                  }
                  alt="상품 이미지"
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>

            {/* 상품 정보 섹션 */}
            <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.productDTO.pname}</h1>
              <div className="text-3xl font-bold text-red-600 mb-6">{product.productDTO.price}</div>
              
              {/* 상품 설명 */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">상품설명</h3>
                <p className="text-gray-700 leading-relaxed text-base">{product.productDTO.pdesc}</p>
              </div>
            </div>

            {/* 수량 선택 섹션 */}
            <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">수량 선택</h3>
              <div className="flex items-center justify-center space-x-6 bg-gray-50 rounded-lg p-4">
                <button
                  className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full text-xl font-bold shadow-sm active:scale-95 hover:border-[#ad9e87]"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                <button
                  className="w-12 h-12 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full text-xl font-bold shadow-sm active:scale-95 hover:border-[#ad9e87]"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {/* 하단 고정 버튼 영역 */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
              <div className="flex space-x-3 max-w-md mx-auto">
                <button
                  className="flex-1 py-4 bg-gray-100 text-gray-800 rounded-lg font-semibold text-lg border border-gray-300 active:scale-95"
                  onClick={clickSubmit}
                >
                  장바구니
                </button>
                <button
                  className="flex-1 py-4 bg-[#ad9e87] text-white rounded-lg font-semibold text-lg active:scale-95 shadow-md"
                  onClick={handleDirectPurchase}
                >
                  바로구매
                </button>
              </div>
            </div>

            {/* 하단 버튼을 위한 여백 */}
            <div className="h-18"></div>
          </div>
        </>
      )}

      {/* 리뷰 컴포넌트 */}
      {!fetching && (
        <div className="lg:mt-6">
          {/* 데스크톱용 리뷰 */}
          <div className="hidden lg:block">
            <ReviewComponent
              count={product.reviewRatingDTO.reviewcount}
              rating={product.reviewRatingDTO.avgrating}
              pno={pno.pno}
            />
          </div>
          
          {/* 모바일용 리뷰 - 패딩 맞춤 */}
          <div className="lg:hidden -mx-6 px-6 bg-white">
            <ReviewComponent
              count={product.reviewRatingDTO.reviewcount}
              rating={product.reviewRatingDTO.avgrating}
              pno={pno.pno}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadComponent;
