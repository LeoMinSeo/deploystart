import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductByPno, modifyProduct } from "../../../api/adminApi";

const ProductsModifyComponent = () => {
  const { pno } = useParams();
  const [productData, setProductData] = useState([]);
  const [formData, setFormData] = useState({
    pname: "",
    price: "",
    pdesc: "",
    pstock: 0,
    category: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileChanged, setFileChanged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProductByPno(pno).then((i) => {
      setProductData(i);
      console.log(i);
      // 상품 데이터가 로드되면 폼 데이터 초기화
      setFormData({
        pname: i.pname || "",
        price: i.price || "",
        pdesc: i.pdesc || "",
        pstock: i.pstock || 0,
        category: i.category || "",
      });
    });
  }, [pno]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileChanged(true);

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitFormData = new FormData();

    submitFormData.append("pno", pno);
    submitFormData.append("pname", formData.pname);
    submitFormData.append("price", formData.price);
    submitFormData.append("pdesc", formData.pdesc);
    submitFormData.append("pstock", formData.pstock);
    submitFormData.append("category", formData.category);

    if (fileChanged && file) {
      submitFormData.append("files", file);
    } else {
      submitFormData.append("uploadFileNames", [
        productData.uploadFileNames[0],
      ]);
    }

    // 확인용 로그
    for (let key of submitFormData.keys()) {
      console.log(key, submitFormData.get(key));
    }
    modifyProduct(submitFormData)
      .then((i) => {
        alert(i);
        navigate("/admin/products/list");
      })
      .catch((error) => {
        console.error("수정 오류:", error);
        alert("상품 수정 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* 왼쪽 이미지 프리뷰 영역 */}
          <div className="w-full md:w-2/5 bg-white p-8 text-black flex flex-col justify-between">
            <div className="flex flex-col items-center justify-center flex-grow">
              {!fileChanged &&
              productData.uploadFileNames &&
              productData.uploadFileNames.length > 0 ? (
                <div className="w-full flex justify-center mb-4">
                  <div className="relative bg-white w-80 h-80 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={`http://localhost:8089/product/view/s_${productData.uploadFileNames[0]}`}
                      alt={productData.pname}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : fileChanged && previewUrl ? (
                <div className="w-full flex justify-center mb-4">
                  <div className="relative bg-white w-80 h-80 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={previewUrl}
                      alt="미리보기"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white w-80 h-80 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 text-orange-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이미지 변경
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  />
                  <div className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-between text-gray-500">
                    <span className="truncate">
                      {fileChanged && file ? file.name : "이미지 파일 선택"}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
                {fileChanged && (
                  <p className="text-xs text-red-500 mt-1">
                    새 이미지를 업로드하면 기존 이미지는 삭제됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 폼 영역 */}
          <div className="w-full md:w-3/5 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              상품 정보 수정
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-5">
                {/* 상품번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품번호
                  </label>
                  <input
                    type="text"
                    value={productData.pno || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500"
                  />
                </div>

                {/* 상품명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품명
                  </label>
                  <input
                    type="text"
                    name="pname"
                    value={formData.pname}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="예: 삼성스피커"
                    required
                  />
                </div>

                {/* 가격 및 카테고리 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상품 가격
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      placeholder="예: 115,000원"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      카테고리
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
                      required
                    >
                      <option value="">카테고리 선택</option>
                      <option value="헤드셋">헤드셋</option>
                      <option value="이어폰">이어폰</option>
                      <option value="스피커">스피커</option>
                      <option value="앰프">앰프</option>
                      <option value=" ">없음</option>
                    </select>
                  </div>
                </div>

                {/* 재고 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    재고
                  </label>
                  <input
                    type="number"
                    name="pstock"
                    value={formData.pstock}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="재고 수량 입력"
                    required
                  />
                </div>

                {/* 상품 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품 설명
                  </label>
                  <textarea
                    name="pdesc"
                    value={formData.pdesc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    rows="5"
                    placeholder="상품에 대한 설명을 입력하세요."
                    required
                  ></textarea>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  onClick={() => window.history.back()}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-400 hover:bg-orange-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsModifyComponent;
