import PocketBase from 'pocketbase';

// Config
const PB_URL = 'http://127.0.0.1:8090';
const ADMIN_EMAIL = 'admin@edu.lipetsk.ru';
const ADMIN_PASS = '12345678'; // Используем тот, что вы создали через CLI

const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const CAMPS_SCHEMA = [
    { name: 'name', type: 'text', required: true },
    { name: 'legal_form', type: 'text' },
    { name: 'ownership_type', type: 'text' },
    { name: 'municipality', type: 'text' },
    
    { name: 'address', type: 'text' },
    { name: 'legal_address', type: 'text' },
    { name: 'director_name', type: 'text' },
    
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email', required: true }, // Important for linking
    { name: 'website', type: 'url' },
    
    { name: 'sanitary_number', type: 'text' },
    { name: 'sanitary_date', type: 'text' },
    { name: 'medical_license', type: 'text' },
    { name: 'education_license', type: 'text' },
    { name: 'inspection_results', type: 'text' },
    
    { name: 'shift_dates', type: 'text' },
    { name: 'capacity', type: 'number' },
    { name: 'ticket_cost', type: 'number' },
    { name: 'accessibility', type: 'text' },
    { name: 'inclusion_date', type: 'text' },

    { name: 'inn', type: 'text' },
    { name: 'oktmo', type: 'text' },
    { name: 'camp_type', type: 'text' },
    { name: 'seasonality', type: 'text' },
    { name: 'has_swimming', type: 'bool' },
    { name: 'age_category', type: 'text' },
    { name: 'is_verified', type: 'bool' }
];

const DOCS_SCHEMA = [
    { name: 'camp', type: 'relation', options: { collectionId: 'camps', cascadeDelete: true } },
    { name: 'type', type: 'text' },
    { name: 'status', type: 'select', options: { values: ['pending', 'verified', 'rejected'] } },
    // 'file' field is created automatically by PocketBase when type is 'file', but we can't easily seed binary files via simple script without fs, 
    // so we will rely on creating the text fields first. The 'file' field needs special handling in creating schema.
];

async function main() {
    console.log(`🔌 Connecting to ${PB_URL}...`);
    
    try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log("✅ Authenticated as Admin");
    } catch (e) {
        console.error("❌ Auth failed. Please run: .\\pocketbase.exe superuser create admin@edu.lipetsk.ru 12345678");
        process.exit(1);
    }

    // --- 1. SETUP SCHEMA ---
    console.log("\n🛠️  Setting up Schema...");

    // Helper to delete collection if exists
    const deleteIfExists = async (name) => {
        try {
            const col = await pb.collections.getFirstListItem(`name="${name}"`, { requestKey: null }).catch(() => null);
            // Actually getByName
            const list = await pb.collections.getFullList();
            const target = list.find(c => c.name === name);
            if (target) {
                await pb.collections.delete(target.id);
                console.log(`   Deleted old collection: ${name}`);
            }
        } catch (e) { /* ignore */ }
    };

    await deleteIfExists('documents'); // Delete docs first due to foreign key
    await deleteIfExists('camps');

    // Create 'camps'
    const campsCollection = await pb.collections.create({
        name: 'camps',
        type: 'base',
        schema: CAMPS_SCHEMA
    });
    console.log("   ✅ Created collection: camps");

    // Create 'documents'
    // Note: Creating file field via API requires specific structure
    const docsCollection = await pb.collections.create({
        name: 'documents',
        type: 'base',
        schema: [
            { name: 'type', type: 'text' },
            { name: 'status', type: 'select', options: { values: ['pending', 'verified', 'rejected'] } },
            { name: 'camp', type: 'relation', required: true, options: { collectionId: campsCollection.id, cascadeDelete: true, maxSelect: 1 } },
            { name: 'file', type: 'file', options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'] } }
        ]
    });
    console.log("   ✅ Created collection: documents");


    // --- 2. SEED USERS ---
    console.log("\n👤 Seeding Users...");
    
    const usersToCreate = [
        { email: 'camp@lipetsk.ru', password: '12345678', name: 'ДОЛ Звездный' },
        { email: 'camp2@lipetsk.ru', password: '12345678', name: 'ДОЛ Березка' },
        { email: 'camp3@lipetsk.ru', password: '12345678', name: 'ДОЛ Солнечный' }
    ];

    for (const u of usersToCreate) {
        try {
            // Check existence logic skipped, just catch error
            await pb.collection('users').create({
                email: u.email,
                emailVisibility: true,
                password: u.password,
                passwordConfirm: u.password,
                name: u.name,
                verified: true
            });
            console.log(`   Created user: ${u.email}`);
        } catch (e) {
            console.log(`   User ${u.email} already exists or error:`, e.response?.message || e.message);
        }
    }


    // --- 3. SEED CAMPS ---
    console.log("\ncamp Seeding Data...");

    const campsData = [
        {
            email: 'camp@lipetsk.ru', // Link to user 1
            name: 'ДОЛ "Звездный"',
            legal_form: 'МАОУ ДО',
            ownership_type: 'Муниципальная',
            municipality: 'Грязинский район',
            address: 'Липецкая обл., Грязинский р-н, с. Ярлуково',
            director_name: 'Иванов Иван Иванович',
            phone: '+7 (4742) 55-55-55',
            inn: '4826001111',
            camp_type: 'Загородный стационарный',
            capacity: 350,
            ticket_cost: 32500,
            is_verified: true,
            sanitary_number: '48.ОЦ.01.000.М.000111.05.23',
            sanitary_date: '25.05.2023',
            medical_license: 'ЛО-48-01-001234',
            has_swimming: true
        },
        {
            email: 'camp2@lipetsk.ru', // Link to user 2
            name: 'ДОЛ "Березка"',
            legal_form: 'ООО',
            ownership_type: 'Частная',
            municipality: 'Задонский район',
            address: 'Липецкая обл., Задонский р-н, урочище Скит',
            director_name: 'Петрова Анна Сергеевна',
            phone: '+7 (4742) 22-22-22',
            inn: '4826002222',
            camp_type: 'Загородный стационарный',
            capacity: 120,
            ticket_cost: 45000,
            is_verified: false,
            sanitary_number: '', // Missing
            medical_license: '', // Missing
            inspection_results: 'Выявлены нарушения пожарной безопасности'
        },
        {
            email: 'camp3@lipetsk.ru', // Link to user 3
            name: 'Санаторий "Солнечный"',
            legal_form: 'АО',
            ownership_type: 'Частная',
            municipality: 'г. Липецк',
            address: 'г. Липецк, ул. Ленина 1',
            director_name: 'Сидоров Олег Петрович',
            phone: '+7 (4742) 33-33-33',
            inn: '4826003333',
            camp_type: 'Санаторий',
            capacity: 500,
            ticket_cost: 52000,
            is_verified: true,
            sanitary_number: '48.ОЦ.01.000.М.000333.05.23',
            sanitary_date: '20.05.2023',
            medical_license: 'ЛО-48-01-003333',
            has_swimming: true
        }
    ];

    for (const c of campsData) {
        try {
            await pb.collection('camps').create(c);
            console.log(`   Created camp: ${c.name}`);
        } catch (e) {
            console.error(`   Failed to create ${c.name}:`, e.response?.data || e.message);
        }
    }

    console.log("\n✅ SEED COMPLETED SUCCESSFULLY!");
    console.log("👉 Now refresh your browser.");
}

main().catch(console.error);
