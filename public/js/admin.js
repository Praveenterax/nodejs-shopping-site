const deleteProductClient = (btn) => {
  console.log(btn);
  const prodId = btn.parentNode.querySelector("[name=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[name=_csrf]").value;

  const parentElement = btn.closest("article");
  console.log(prodId, csrfToken);
  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrfToken,
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      parentElement.remove();
      console.log(data);
    })
    .catch((err) => console.log(err));
};
