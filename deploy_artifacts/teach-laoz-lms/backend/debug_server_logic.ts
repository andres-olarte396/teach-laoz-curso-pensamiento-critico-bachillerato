
import { SQLiteUserRepository } from './src/infrastructure/repositories/SQLiteUserRepository.js';
import { UpdateUser } from './src/application/use-cases/user/UpdateUser.js';

async function run() {
    console.log('--- LOGIC DEBUG START ---');
    const repo = new SQLiteUserRepository();
    
    // 1. Find User
    const email = 'andres.olarte@teachlaoz.edu';
    const user = await repo.findByEmail(email);
    console.log('Initial User from Repo:', user);

    if (!user) {
        console.error('User not found!');
        return;
    }

    // 2. Simulate Update via Use Case
    const updateUseCase = new UpdateUser(repo);
    const fakeUrl = '/api/uploads/TEST_DEBUG_' + Date.now() + '.jpg';
    
    console.log('Attempting to update avatarUrl to:', fakeUrl);
    const updated = await updateUseCase.execute(user.id, {
        avatarUrl: fakeUrl
    });
    console.log('Update Result:', updated);

    // 3. Verify Persistence
    const freshUser = await repo.findById(user.id);
    console.log('Fresh User from Repo:', freshUser);

    if (freshUser?.avatarUrl === fakeUrl) {
        console.log('SUCCESS: Logic is sound.');
    } else {
        console.log('FAILURE: Persistence did not work.');
    }
}

run().catch(console.error);
