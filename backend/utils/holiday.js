const https = require('https');

class HolidayUtil {
  static async isHoliday(date = new Date()) {
    const dateStr = this.formatDate(date);

    try {
      return await this.checkFromAPI(dateStr);
    } catch (error) {
      return this.checkFromLocal(date);
    }
  }

  static formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static async checkFromAPI(dateStr) {
    return new Promise((resolve, reject) => {
      const url = `http://timor.tech/api/holiday/info/${dateStr}`;

      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.code === 0 && result.type) {
              const t = result.type.type;
              resolve(t === 1 || t === 2);
            } else {
              const dayOfWeek = new Date(dateStr).getDay();
              resolve(dayOfWeek === 0 || dayOfWeek === 6);
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  static checkFromLocal(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.getDay();

    const holidays = this.getHolidays(year);
    const dateStr = `${month}-${day}`;

    if (holidays.includes(dateStr)) {
      return true;
    }

    const workdays = this.getWorkdays(year);
    if (workdays.includes(dateStr)) {
      return false;
    }

    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  static getHolidays(year) {
    const holidays = {
      2024: [
        '1-1',
        '2-10', '2-11', '2-12', '2-13', '2-14', '2-15', '2-16', '2-17',
        '4-4', '4-5', '4-6',
        '5-1', '5-2', '5-3', '5-4', '5-5',
        '6-8', '6-9', '6-10',
        '9-15', '9-16', '9-17',
        '10-1', '10-2', '10-3', '10-4', '10-5', '10-6', '10-7'
      ],
      2025: [
        '1-1',
        '1-28', '1-29', '1-30', '1-31', '2-1', '2-2', '2-3', '2-4',
        '4-4', '4-5', '4-6',
        '5-1', '5-2', '5-3', '5-4', '5-5',
        '5-31', '6-1', '6-2',
        '10-1', '10-2', '10-3', '10-4', '10-5', '10-6', '10-7'
      ],
      2026: [
        '1-1', '1-2', '1-3',
        '2-17', '2-18', '2-19', '2-20', '2-21', '2-22', '2-23',
        '4-5', '4-6', '4-7',
        '5-1', '5-2', '5-3', '5-4', '5-5',
        '6-19', '6-20', '6-21',
        '9-25', '9-26', '9-27',
        '10-1', '10-2', '10-3', '10-4', '10-5', '10-6', '10-7'
      ]
    };

    return holidays[year] || [];
  }

  static getWorkdays(year) {
    const workdays = {
      2024: ['2-4', '2-18', '4-7', '4-28', '5-11', '9-14', '9-29', '10-12'],
      2025: ['1-26', '2-8', '4-27', '9-28', '10-11'],
      2026: ['1-24', '2-14', '2-15', '4-26', '9-27', '10-10']
    };

    return workdays[year] || [];
  }
}

module.exports = HolidayUtil;
