document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('subscribe-plus').addEventListener('click', function(event) {
        event.preventDefault();

        const IMP = window.IMP;
        IMP.init('imp05870721');

        const paymentData = {
            pg: 'kakaopay.TCSUBSCRIP',
            pay_method: 'card',
            merchant_uid: 'order_' + new Date().getTime(),
            name: 'Plus+ 정기결제',
            amount: 2000,
            buyer_email: 'customer@example.com',
            buyer_name: '구매자이름',
            buyer_tel: '010-1234-5678',
            buyer_addr: '서울특별시 강남구 삼성동',
            buyer_postcode: '123-456',
            custom_data: {
                channel_key: 'channel-key-3e3d4764-c8a0-4534-9491-11e2c18539e3'
            },
            tax_free: 0,
        };

        IMP.request_pay(paymentData, function (rsp) {
            if (rsp.success) {
                // 결제 성공 시 로직
                Swal.fire({
                    title: '결제가 완료되었습니다!',
                    text: '주문 번호: ' + rsp.merchant_uid,
                    icon: 'success',
                    confirmButtonText: '확인'
                }).then(() => {
                    // 결제 정보를 로컬 스토리지에 저장
                    savePaymentHistory(rsp, paymentData.amount);
                    console.log(rsp);
                });
            } else {
                // 결제 실패 시 로직
                Swal.fire({
                    title: '결제에 실패하였습니다',
                    text: '에러 내용: ' + rsp.error_msg,
                    icon: 'error',
                    confirmButtonText: '확인'
                }).then(() => {
                    console.log(rsp);
                });
            }
        });
    });
});

function savePaymentHistory(paymentData, amount) {
    let paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    paymentHistory.push({
        merchant_uid: paymentData.merchant_uid,
        name: paymentData.name,
        amount: amount,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
}