// 创建样式
const style = document.createElement('style');
style.textContent = `
.profit-indicator {
    display: inline-block;
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
}
.profit-positive {
    background-color: rgba(34, 197, 94, 0.2);
    color: #22c55e;
}
.profit-negative {
    background-color: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}
.profit-neutral {
    background-color: rgba(156, 163, 175, 0.2);
    color: #9ca3af;
}
`;
document.head.appendChild(style);

// 主函数
window.onload = () => {
    // 等待DOM加载完成后点击Trades标签
    setTimeout(() => {
        const tradesTab = document.querySelector('body > main > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)');
        if (tradesTab) {
            tradesTab.click();
            // 等待交易数据加载
            setTimeout(calculateProfits, 1000);
        }
    }, 1000);
};

// 计算盈亏的主函数
function calculateProfits() {
    const accountProfits = new Map(); // 存储账户的交易记录
    const accountBalances = new Map(); // 存储账户的SOL余额

    // 获取所有交易行
    const trades = document.querySelectorAll('tbody tr');

    // 首先收集所有交易数据
    trades.forEach(trade => {
        const accountLink = trade.querySelector('td:first-child a');
        if (!accountLink) return;

        const account = accountLink.href.split('/profile/')[1];
        const type = trade.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const solAmount = parseFloat(trade.querySelector('td:nth-child(4)').textContent);

        if (!accountProfits.has(account)) {
            accountProfits.set(account, []);
        }

        accountProfits.get(account).push({
            type,
            solAmount,
        });
    });

    console.log(accountProfits);

    // 计算每个账户的盈亏并显示
    accountProfits.forEach((trades, account) => {
        let totalBought = 0;
        let totalSold = 0;
        let boughtCount = 0;
        let soldCount = 0;

        trades.forEach(trade => {
            if (trade.type.includes('buy')) {
                totalBought += trade.solAmount;
                boughtCount++;
            } else if (trade.type.includes('sell')) {
                totalSold += trade.solAmount;
                soldCount++;
            }
        });

        // 找到对应账户的DOM元素并添加盈亏显示
        const accountElements = document.querySelectorAll(`a[href="/profile/${account}"]`);
        accountElements.forEach(element => {
            // 如果已经添加过盈亏显示，则跳过
            if (element.parentElement.querySelector('.profit-indicator')) return;

            const profitElement = document.createElement('span');
            profitElement.className = 'profit-indicator';

            let profitText = '-';
            let profitClass = 'profit-neutral';

            // 只有当有买入和卖出记录时才计算盈亏
            if (boughtCount > 0 && soldCount > 0) {
                const profit = totalSold - totalBought;
                profitText = `${profit.toFixed(4)} SOL`;
                profitClass = profit > 0 ? 'profit-positive' : 'profit-negative';
            }

            profitElement.textContent = profitText;
            profitElement.classList.add(profitClass);
            element.parentElement.appendChild(profitElement);
        });
    });
}