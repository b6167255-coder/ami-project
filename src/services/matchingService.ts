import { supabase } from '../lib/supabase';

export async function createRequestAndNotify(
  requestId: string,
  requestDate: string,
  kindergartenId: string
) {
  try {
    const { data: availabilityData } = await supabase
      .from('availability')
      .select('substitute_id')
      .eq('available_date', requestDate)
      .eq('is_available', true);

    const availableSubstitutes =
      availabilityData?.map((a) => a.substitute_id) || [];

    if (availableSubstitutes.length === 0) {
      return { matched: 0, notified: 0 };
    }

    const { data: preferencesData } = await supabase
      .from('kindergarten_preferences')
      .select('substitute_id')
      .eq('kindergarten_id', kindergartenId);

    const preferredSubstitutes =
      preferencesData?.map((p) => p.substitute_id) || [];

    const matchedSubstitutes = availableSubstitutes.filter((id) =>
      preferredSubstitutes.includes(id)
    );

    if (matchedSubstitutes.length === 0) {
      return { matched: 0, notified: 0 };
    }

    const { data: matchRecords } = await supabase
      .from('request_matches')
      .insert(
        matchedSubstitutes.map((substitute_id) => ({
          request_id: requestId,
          substitute_id,
          notification_method: 'email',
        }))
      )
      .select();

    const { data: requestData } = await supabase
      .from('substitute_requests')
      .select(
        `
        request_date,
        kindergartens:kindergarten_id ( name ),
        users:requesting_teacher_id ( full_name, phone )
      `
      )
      .eq('id', requestId)
      .single();

    const { data: substituteData } = await supabase
      .from('users')
      .select('id, email, full_name, phone')
      .in('id', matchedSubstitutes);

    for (const substitute of substituteData || []) {
      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notifications`;

        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: 'email',
            to: substitute.email,
            substitute_name: substitute.full_name,
            kindergarten_name: requestData?.kindergartens?.name,
            request_date: requestData?.request_date,
            message: `בקשה חדשה: ${requestData?.kindergartens?.name} בתאריך ${requestData?.request_date}`,
          }),
        });
      } catch (err) {
        console.error(`Failed to send email to ${substitute.email}:`, err);
      }
    }

    return {
      matched: matchedSubstitutes.length,
      notified: matchRecords?.length || 0,
    };
  } catch (error) {
    console.error('Error in matching service:', error);
    throw error;
  }
}

export async function getMatchedSubstitutes(requestId: string) {
  const { data } = await supabase
    .from('request_matches')
    .select(
      `
      id,
      substitute_id,
      notified_at,
      users:substitute_id ( id, full_name, phone, email )
    `
    )
    .eq('request_id', requestId);

  return data;
}
