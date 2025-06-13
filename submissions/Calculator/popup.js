class BrutalistCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.memoryDisplay = document.getElementById('memory');
        this.currentInput = '0';
        this.operator = null;
        this.previousInput = null;
        this.waitingForNewInput = false;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {

        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleButtonClick(button);
            });
        });

            document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;

        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);

        switch (action) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'equals':
                this.calculate();
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'clear-all':
                this.clearAll();
                break;
            case 'clear-entry':
                this.clearEntry();
                break;
        }
    }

    handleKeyPress(e) {
        e.preventDefault();
        
        if (e.key >= '0' && e.key <= '9') {
            this.inputNumber(e.key);
        } else if (e.key === '.') {
            this.inputDecimal();
        } else if (['+', '-', '*', '/'].includes(e.key)) {
            this.inputOperator(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clearAll();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            this.clearEntry();
        }
    }

    updateDisplay() {
        let displayValue = this.currentInput;
        

        if (displayValue.length > 12) {
            const num = parseFloat(displayValue);
            displayValue = num.toExponential(6);
        }
        
        this.display.textContent = displayValue;
    }

    updateMemory() {
        if (this.previousInput !== null && this.operator !== null) {
            this.memoryDisplay.textContent = `${this.previousInput} ${this.operator}`;
        } else {
            this.memoryDisplay.textContent = '';
        }
    }

    inputNumber(num) {
        if (this.waitingForNewInput) {
            this.currentInput = num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }

    inputDecimal() {
        if (this.waitingForNewInput) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }

    inputOperator(op) {
        if (this.previousInput !== null && this.operator !== null && !this.waitingForNewInput) {
            this.calculate();
        }
        
        this.previousInput = this.currentInput;
        this.operator = op;
        this.waitingForNewInput = true;
        this.updateMemory();
    }

    calculate() {
        if (this.previousInput === null || this.operator === null) return;
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;
        
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentInput = 'ERROR';
                    this.previousInput = null;
                    this.operator = null;
                    this.waitingForNewInput = true;
                    this.updateDisplay();
                    this.updateMemory();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
            if (isNaN(result) || !isFinite(result)) {
            this.currentInput = 'ERROR';
        } else {
            this.currentInput = result.toString();
        }
        
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewInput = true;
        this.updateDisplay();
        this.updateMemory();
    }

    clearEntry() {
        this.currentInput = '0';
        this.updateDisplay();
    }

    clearAll() {
        this.currentInput = '0';
        this.previousInput = null;
        this.operator = null;
        this.waitingForNewInput = false;
        this.updateDisplay();
        this.updateMemory();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new BrutalistCalculator();
});