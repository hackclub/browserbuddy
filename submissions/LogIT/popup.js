document.addEventListener("DOMContentLoaded", function () {
    const amountInput = document.getElementById("amount");
    const descriptionInput = document.getElementById("description");
    const tagInput = document.getElementById("tags");
    const addExpenseBtn = document.getElementById("addExpense");
    const copyAllBtn = document.getElementById("copyAll");
    const exportCSVBtn = document.getElementById("exportCSV");
    const totalBtn = document.getElementById("calculateTotal");
    const expenseList = document.getElementById("expenseList");
    const totalAmountDisplay = document.getElementById("totalAmount");
    const dateDisplay = document.getElementById("dateDisplay");
    const tagFilter = document.getElementById("tagFilter");

    // Display Date in DD/MM/YYYY format
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    dateDisplay.textContent = `Date: ${formattedDate}`;

    let expenses = [];

    // Load stored expenses
    chrome.storage.local.get("expenses", (data) => {
        if (data.expenses) {
            expenses = data.expenses;
            updateList();
        }
    });

    function updateList(filterTag = null) {
        expenseList.innerHTML = "";
        let total = 0;

        expenses.forEach((expense, index) => {
            if (filterTag && !expense.tags.includes(filterTag)) return;

            const li = document.createElement("li");
            li.innerHTML = `
                <span class="expense-text">${expense.amount} - ${expense.description} [${expense.tags.join(", ")}]</span>
                <div class="expense-buttons">
                    <button class="edit-amount" data-index="${index}">✏️</button>
                    <button class="edit-desc" data-index="${index}">📝</button>
                    <button class="edit-tags" data-index="${index}">🏷️</button>
                    <button class="delete" data-index="${index}">❌</button>
                </div>
            `;
            total += parseFloat(expense.amount);
            expenseList.appendChild(li);
        });

        totalAmountDisplay.textContent = `Total: ${total.toFixed(2)}`;

        chrome.storage.local.set({ expenses });
    }

    addExpenseBtn.addEventListener("click", () => {
        const amount = amountInput.value.trim();
        const description = descriptionInput.value.trim();
        const tags = tagInput.value.trim().split(",").map(tag => tag.trim()).filter(tag => tag !== "");

        if (amount === "" || description === "" || isNaN(amount) || parseFloat(amount) < 0) return;

        expenses.push({ amount, description, tags });
        updateList();
        amountInput.value = "";
        descriptionInput.value = "";
        tagInput.value = "";
    });

    expenseList.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        if (e.target.classList.contains("delete")) {
            expenses.splice(index, 1);
            updateList();
        } else if (e.target.classList.contains("edit-amount")) {
            const newAmount = prompt("Edit amount:", expenses[index].amount);
            if (newAmount !== null && !isNaN(newAmount) && parseFloat(newAmount) >= 0) {
                expenses[index].amount = newAmount.trim();
                updateList();
            }
        } else if (e.target.classList.contains("edit-desc")) {
            const newDesc = prompt("Edit description:", expenses[index].description);
            if (newDesc !== null) {
                expenses[index].description = newDesc.trim();
                updateList();
            }
        } else if (e.target.classList.contains("edit-tags")) {
            const newTags = prompt("Edit tags (comma-separated):", expenses[index].tags.join(", "));
            if (newTags !== null) {
                expenses[index].tags = newTags.split(",").map(tag => tag.trim()).filter(tag => tag !== "");
                updateList();
            }
        }
    });

    copyAllBtn.addEventListener("click", () => {
        let text = `Date: ${formattedDate}\n\n`;
        expenses.forEach(expense => {
            text += `${expense.amount} - ${expense.description} [${expense.tags.join(", ")}]\n`;
        });
        text += `\nTotal - ${expenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0)}`;

        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        });
    });

    exportCSVBtn.addEventListener("click", () => {
        let csv = `Date,${formattedDate}\nAmount,Description,Tags\n`;
        expenses.forEach(exp => {
            csv += `${exp.amount},${exp.description},"${exp.tags.join(", ")}"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "expenses.csv";
        link.click();
    });

    totalBtn.addEventListener("click", () => {
        const total = expenses.reduce((sum, ex) => sum + parseFloat(ex.amount), 0);
        alert(`Total Expenses: ${total}`);
    });

    tagFilter.addEventListener("input", () => {
        updateList(tagFilter.value.trim());
    });
});
