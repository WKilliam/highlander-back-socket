export class Dice {
    static calculateLuckPercentage(luckFactor) {
        const percentage = 1.975 * luckFactor + 40.5;
        return Math.max(1, Math.min(percentage, 80)); // Assure que le pourcentage est entre 1% et 80%
    }

    static diceRuning(luckFactor, arrayLimited, min, max): Array<number> {
        let tabAllValue: Array<number> = [];
        let totalElements = 0;
        if (arrayLimited.length === 0) {
            for (let i = 1; i <= 20; i++) {
                let percentOfValue = this.calculateLuckPercentage(luckFactor - i + 10);
                let numberOfTimes = Math.round(1000 * percentOfValue / 100);
                totalElements += numberOfTimes;

                for (let j = 0; j < numberOfTimes; j++) {
                    tabAllValue.push(i);
                }
            }
            this.adjustArray(tabAllValue, totalElements, 1000);
        } else {
            min = arrayLimited[0];
            max = arrayLimited[1];
            tabAllValue.push(Math.floor(Math.random() * (max - min + 1)) + min)
        }

        // Mélanger le tableau pour la distribution aléatoire
        this.shuffleArray(tabAllValue);

        return tabAllValue;
    }

    static adjustArray(array, currentSize, targetSize) {
        while (currentSize < targetSize) {
            array.push(Math.floor(Math.random() * 20) + 1);
            currentSize++;
        }
        while (currentSize > targetSize) {
            let indexToRemove = Math.floor(Math.random() * array.length);
            array.splice(indexToRemove, 1);
            currentSize--;
        }
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Échange éléments
        }
    }

    static countElements(array) {
        const counts = {};

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            counts[element] = (counts[element] || 0) + 1;
        }

        return counts;
    }
}
