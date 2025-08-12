class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
        this.setupEventListeners();
        
        
        this.showStartup();
    }

    showStartup() {
        this.currentOperandElement.innerText = '- READY -';
        setTimeout(() => {
            this.currentOperandElement.innerText = '0';
        }, 1000);
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
    }

    delete() {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }
        
        if (this.currentOperand === 'Error') {
            this.clear();
        }
        
        if (number === '.' && this.currentOperand.includes('.')) return;
        
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') {
            this.clear();
            return;
        }
        
        if (this.currentOperand === '') return;
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        try {
            switch (this.operation) {
                case '+':
                    computation = prev + current;
                    break;
                case '-':
                    computation = prev - current;
                    break;
                case '×':
                    computation = prev * current;
                    break;
                case '÷':
                    if (current === 0) {
                        throw new Error('Cannot divide by zero');
                    }
                    computation = prev / current;
                    break;
                default:
                    return;
            }
            
            if (!isFinite(computation)) {
                throw new Error('Invalid calculation');
            }
            
            computation = Math.round((computation + Number.EPSILON) * 100000000) / 100000000;
            
            this.currentOperand = computation.toString();
            this.operation = undefined;
            this.previousOperand = '';
            this.shouldResetDisplay = true;
            
        } catch (error) {
            this.handleError(error.message);
        }
    }

    handleError(message) {
        this.currentOperand = 'ERROR';
        this.previousOperand = '';
        this.operation = undefined;
        
        this.currentOperandElement.parentElement.classList.add('error');
        setTimeout(() => {
            this.currentOperandElement.parentElement.classList.remove('error');
        }, 1800);
        
        console.error('Calculator Error:', message);
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        if (this.currentOperand === '') {
            this.currentOperandElement.innerText = '0';
        } else if (this.currentOperand === 'ERROR') {
            this.currentOperandElement.innerText = 'ERROR';
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        }
        
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
    }

    setupEventListeners() {
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', () => {
                this.appendNumber(button.innerText);
                this.updateDisplay();
                this.addPressedEffect(button);
            });
        });

        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', () => {
                this.chooseOperation(button.innerText);
                this.updateDisplay();
                this.addPressedEffect(button);
            });
        });

        document.querySelector('[data-equals]').addEventListener('click', () => {
            this.compute();
            this.updateDisplay();
            this.addPressedEffect(document.querySelector('[data-equals]'));
        });

        document.querySelector('[data-clear]').addEventListener('click', () => {
            this.clear();
            this.updateDisplay();
            this.addPressedEffect(document.querySelector('[data-clear]'));
        });

        document.querySelector('[data-delete]').addEventListener('click', () => {
            this.delete();
            this.updateDisplay();
            this.addPressedEffect(document.querySelector('[data-delete]'));
        });

        document.addEventListener('keydown', (e) => {
            this.handleKeyboardInput(e);
        });
    }

    handleKeyboardInput(e) {
        const key = e.key;
        
        if ('0123456789.+-*/='.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            e.preventDefault();
        }
        
        if ('0123456789.'.includes(key)) {
            this.appendNumber(key);
            this.updateDisplay();
            this.highlightKeyboardButton(key);
        }
        
        if (key === '+') {
            this.chooseOperation('+');
            this.updateDisplay();
            this.highlightKeyboardButton('+');
        } else if (key === '-') {
            this.chooseOperation('-');
            this.updateDisplay();
            this.highlightKeyboardButton('-');
        } else if (key === '*') {
            this.chooseOperation('×');
            this.updateDisplay();
            this.highlightKeyboardButton('×');
        } else if (key === '/') {
            this.chooseOperation('÷');
            this.updateDisplay();
            this.highlightKeyboardButton('÷');
        }
        
        if (key === '=' || key === 'Enter') {
            this.compute();
            this.updateDisplay();
            this.highlightKeyboardButton('=');
        }
        
        if (key === 'Escape') {
            this.clear();
            this.updateDisplay();
            this.highlightKeyboardButton('AC');
        }
        
        if (key === 'Backspace') {
            this.delete();
            this.updateDisplay();
            this.highlightKeyboardButton('DEL');
        }
    }

    addPressedEffect(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    highlightKeyboardButton(key) {
        let button;
        
        if ('0123456789.'.includes(key)) {
            const numberButtons = document.querySelectorAll('[data-number]');
            button = Array.from(numberButtons).find(btn => btn.innerText === key);
        } else if ('+-×÷'.includes(key)) {
            const operationButtons = document.querySelectorAll('[data-operation]');
            button = Array.from(operationButtons).find(btn => btn.innerText === key);
        } else if (key === '=') {
            button = document.querySelector('[data-equals]');
        } else if (key === 'AC') {
            button = document.querySelector('[data-clear]');
        } else if (key === 'DEL') {
            button = document.querySelector('[data-delete]');
        }
        
        if (button) {
            this.addPressedEffect(button);
        }
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previous-operand');
    const currentOperandElement = document.getElementById('current-operand');

    const calculator = new Calculator(previousOperandElement, currentOperandElement);
    calculator.updateDisplay();

    console.log('RETRO-CALC 90 initialized!');
    console.log('Keyboard shortcuts available');
});
