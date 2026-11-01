import Setting from '@/models/Setting';

export async function getSettings() {
  const s = await Setting.findOneAndUpdate(
    { key: 'site' },
    { $setOnInsert: { key: 'site' } },
    { upsert: true, new: true }
  ).lean();
  return {
    depositAccounts: s.depositAccounts || [],
    minDeposit: s.minDeposit ?? 50,
    minWithdrawal: s.minWithdrawal ?? 200,
    announcement: s.announcement || '',
  };
}
