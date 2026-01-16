export class TextGenerator {
    constructor() {
        this.templates = {
            'color': [
                (val) => `Warna adalah ${val}`,
                (val) => `Cari yang berwarna ${val}`,
                (val) => `Pilih elemen ${val}`,
                (val) => `Target: ${val}`,
                (val) => `Ingat: ${val}`,
                (val) => `Harus ${val}`
            ],
            'shape': [
                (val) => `Bentuk adalah ${val}`,
                (val) => `Cari bentuk ${val}`,
                (val) => `Pilih yang ${val}`,
                (val) => `Target: ${val}`,
                (val) => `Objek ${val}`,
                (val) => `Harus ${val}`
            ],
            'number_even': [
                () => "Angka GENAP",
                () => "Pilih angka GENAP",
                () => "Cari bilangan GENAP",
                () => "Target: GENAP"
            ],
            'number_odd': [
                () => "Angka GANJIL",
                () => "Pilih angka GANJIL",
                () => "Cari bilangan GANJIL",
                () => "Target: GANJIL"
            ],
            'number_gt': [
                (val) => `Angka > ${val}`,
                (val) => `Lebih besar dari ${val}`,
                (val) => `Cari angka diatas ${val}`,
                (val) => `Min. ${val + 1}`
            ],
            'number_lt': [
                (val) => `Angka < ${val}`,
                (val) => `Lebih kecil dari ${val}`,
                (val) => `Cari angka dibawah ${val}`,
                (val) => `Maks. ${val - 1}`
            ],
            'negation': [
                (desc) => `BUKAN ${desc}`,
                (desc) => `JANGAN pilih ${desc}`,
                (desc) => `HINDARI ${desc}`,
                (desc) => `Kecuali ${desc}`
            ]
        };
    }

    getDescription(type, value, level) {
        let list = this.templates[type];
        if (!list) return value;

        // Higher level = more variety/cryptic?
        // For now just random pick to confuse player
        const template = list[Math.floor(Math.random() * list.length)];
        return template(value);
    }
}
