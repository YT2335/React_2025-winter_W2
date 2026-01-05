import axios from "axios";
import { useState } from "react";

// API 設定
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 表單資料狀態(儲存登入表單輸入)
  const [account, setAccount] = useState({
    username: "ytlego2335@gmail.com",
    password: "",
  });

  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState({});

  const handleInputChange = (event) => {
    const { value, name } = event.target;

    // 表單輸入處理
    setAccount({
      ...account, // 保留原有屬性
      [name]: value, // 更新特定屬性
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      // 登入
      const loginRes = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      const { token, expired } = loginRes.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
      axios.defaults.headers.common["Authorization"] = token;

      // 取得產品
      const productsRes = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(productsRes.data.products);

      //全部成功才登入成功
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
      setIsAuth(false);
    }
  };

  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      alert("使用者已登入");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                name="username"
                value={account.username}
                onChange={handleInputChange}
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                name="password"
                value={account.password}
                onChange={handleInputChange}
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2026~∞ - 六角學院</p>
        </div>
      ) : (
        <div className="container mt-5">
          <div className="row">
            <div className="col-6">
              <button onClick={checkUserLogin} className="btn btn-success mb-5">
                檢查使用者是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <th scope="row">{product.title}</th>
                        <td>{product.origin_price}</td>
                        <td>{product.price}</td>
                        <td>{product.is_enabled ? "是" : "否"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setTempProduct(product);
                            }}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-6">
              <h2>單一產品細節</h2>
              {tempProduct.title ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top w-50 rounded-0 mx-auto"
                    alt={tempProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge text-bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">{tempProduct.description}</p>
                    <p className="card-text">{tempProduct.content}</p>
                    <p className="card-text">
                      <del>{tempProduct.origin_price}</del> 元 /
                      {tempProduct.price} 元
                    </p>
                    <h5 className="card-title">更多圖片：</h5>
                    {tempProduct.imagesUrl
                      ?.filter((image) => image) // 過濾 "", null, undefined
                      .map((image, index) => {
                        return (
                          <img
                            src={image}
                            key={index}
                            className="img-fluid img-fixed w-50 p-1"
                          />
                        );
                      })}
                  </div>
                </div>
              ) : (
                <p className="text-muted">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
