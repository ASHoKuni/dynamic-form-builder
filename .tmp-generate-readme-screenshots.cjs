const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(process.cwd(), 'docs', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const baseUrl = 'https://dynamic-form-builder-pi-neon.vercel.app/';
  const viewport = { width: 1918, height: 930 };

  const schemaFull = [
    { id: 'f_1', key: 'employee_id', type: 'integer', title: 'Employee Id', required: true, behavior: { autoIncrement: true, unique: true } },
    { id: 'f_2', key: 'first_name', type: 'text', title: 'First Name', required: true },
    { id: 'f_3', key: 'last_name', type: 'text', title: 'Last Name', required: true },
    { id: 'f_4', key: 'email', type: 'email', title: 'Email', required: true },
    { id: 'f_5', key: 'phone_number', type: 'phone', title: 'Phone Number', required: true },
    { id: 'f_6', key: 'address', type: 'textarea', title: 'Address', required: false },
    { id: 'f_7', key: 'birth_date', type: 'datetime', title: 'Birth Date', required: false },
    { id: 'f_8', key: 'experience', type: 'decimal', title: 'Experience', required: false },
    { id: 'f_9', key: 'no_of_dependents', type: 'integer', title: 'No Of Dependents', required: false },
    { id: 'f_10', key: 'profile_link', type: 'url', title: 'Profile Link', required: false },
  ];

  const recordsSample = [
    {
      employee_id: 1,
      first_name: 'ashok',
      last_name: 'dhokare',
      email: 'ashok@gmail.com',
      phone_number: '+12323223',
      address: 'pune mh 411045',
      birth_date: '2026-08-10T17:05',
      experience: 8.5,
      no_of_dependents: 1,
      profile_link: 'https://linkedin.com/in/ashok-dhokare',
    },
    {
      employee_id: 2,
      first_name: 'vaibhav',
      last_name: 'dhokare',
      email: 'taet@gmai.com',
      phone_number: '+1211222',
      address: 'sss',
      birth_date: '2026-08-05T17:07',
      experience: 11,
      no_of_dependents: 0,
      profile_link: 'http://google.com',
    },
  ];

  async function shot(name, { schema, records, tab, actions }) {
    const page = await browser.newPage({ viewport });

    await page.addInitScript(
      ({ schemaData, recordsData }) => {
        localStorage.clear();
        localStorage.setItem('dfb.schema', JSON.stringify(schemaData));
        localStorage.setItem('dfb.records', JSON.stringify(recordsData));
      },
      { schemaData: schema, recordsData: records }
    );

    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    if (tab === 'Field Builder') {
      await page.getByRole('button', { name: 'Field Builder', exact: true }).click();
    }

    if (tab === 'Employees') {
      await page.getByRole('button', { name: 'Employees', exact: true }).click();
    }

    if (actions) {
      await actions(page);
    }

    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    await page.close();
    console.log('Saved', name);
  }

  await shot('employees-no-fields-configured.png', {
    schema: [],
    records: [],
    tab: 'Employees',
  });

  await shot('field-builder-empty.png', {
    schema: [],
    records: [],
    tab: 'Field Builder',
  });

  await shot('field-builder-populated-profile-link.png', {
    schema: schemaFull,
    records: [],
    tab: 'Field Builder',
    actions: async (page) => {
      await page.getByText('Profile Link').first().click();
    },
  });

  const schemaUntitled = [{ id: 'f_u1', key: 'field', type: 'text', title: '', required: false }, ...schemaFull.slice(1)];
  await shot('field-builder-untitled-selected.png', {
    schema: schemaUntitled,
    records: [],
    tab: 'Field Builder',
    actions: async (page) => {
      await page.getByText('(Untitled)').first().click();
    },
  });

  await shot('employees-with-records.png', {
    schema: schemaFull,
    records: recordsSample,
    tab: 'Employees',
  });

  await shot('employees-no-matching-records.png', {
    schema: schemaFull,
    records: recordsSample,
    tab: 'Employees',
    actions: async (page) => {
      const filters = page.getByPlaceholder('Search');
      await filters.first().fill('ashokx');
    },
  });

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
