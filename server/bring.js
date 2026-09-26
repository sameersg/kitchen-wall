// Server-side Bring! shopping list client using native fetch

const BRING_API_BASE = 'https://api.getbring.com/rest/v2/';
const BRING_HEADERS = {
  'X-BRING-API-KEY': 'cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp',
  'X-BRING-CLIENT': 'webApp',
  'X-BRING-CLIENT-SOURCE': 'webApp',
  'X-BRING-COUNTRY': 'DE'
};

/**
 * Log into Bring! using email and password
 */
export async function bringLogin(email, password) {
  if (!email || !password) {
    throw new Error('E-Mail und Passwort sind erforderlich.');
  }

  const res = await fetch(`${BRING_API_BASE}bringauth`, {
    method: 'POST',
    headers: {
      ...BRING_HEADERS,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: new URLSearchParams({ email, password }).toString()
  });

  if (!res.ok) {
    let errorMsg = 'Anmeldung bei Bring! fehlgeschlagen.';
    try {
      const errJson = await res.json();
      if (errJson.message) errorMsg = errJson.message;
    } catch {
      // fallback
    }
    if (res.status === 401 || res.status === 400) {
      errorMsg = 'Ungültige Zugangsdaten. Bitte prüfe deine Bring!-E-Mail und dein Passwort.';
    }
    throw new Error(errorMsg);
  }

  const data = await res.json();
  const token = data.access_token;
  const userUuid = data.uuid;
  const userName = data.name || email.split('@')[0];
  const defaultListUuid = data.bringListUuid;

  // Fetch available lists for the user
  let lists = [];
  try {
    lists = await bringGetLists(userUuid, token);
  } catch (err) {
    console.warn('Could not load Bring lists right after login:', err.message);
    if (defaultListUuid) {
      lists = [{ listUuid: defaultListUuid, name: 'Standard-Liste' }];
    }
  }

  return {
    success: true,
    userUuid,
    userName,
    token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    lists,
    activeListUuid: defaultListUuid || (lists[0] && lists[0].listUuid) || ''
  };
}

/**
 * Get all shopping lists for the authenticated user
 */
export async function bringGetLists(userUuid, token) {
  const res = await fetch(`${BRING_API_BASE}bringusers/${userUuid}/lists`, {
    headers: {
      ...BRING_HEADERS,
      'X-BRING-USER-UUID': userUuid,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Listen konnten nicht geladen werden (${res.status})`);
  }

  const data = await res.json();
  return data.lists || [];
}

/**
 * Get items (purchase and recently) from a list
 */
export async function bringGetItems(listUuid, userUuid, token) {
  const headers = {
    ...BRING_HEADERS,
    'Authorization': `Bearer ${token}`
  };
  if (userUuid) {
    headers['X-BRING-USER-UUID'] = userUuid;
  }

  const res = await fetch(`${BRING_API_BASE}bringlists/${listUuid}`, {
    headers
  });

  if (!res.ok) {
    throw new Error(`Bring-Artikel konnten nicht abgerufen werden (${res.status})`);
  }

  const data = await res.json();
  return {
    purchase: data.purchase || [],
    recently: data.recently || []
  };
}

/**
 * Add an item to the shopping list (purchase)
 */
export async function bringSaveItem(listUuid, userUuid, token, itemName, specification = '') {
  const headers = {
    ...BRING_HEADERS,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
  if (userUuid) {
    headers['X-BRING-USER-UUID'] = userUuid;
  }

  const body = `&purchase=${encodeURIComponent(itemName)}&recently=&specification=${encodeURIComponent(specification)}&remove=&sender=null`;

  const res = await fetch(`${BRING_API_BASE}bringlists/${listUuid}`, {
    method: 'PUT',
    headers,
    body
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Artikel "${itemName}" konnte nicht gespeichert werden (${res.status})`);
  }
  return true;
}

/**
 * Mark an item as checked (moves to recently)
 */
export async function bringMoveToRecent(listUuid, userUuid, token, itemName) {
  const headers = {
    ...BRING_HEADERS,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
  if (userUuid) {
    headers['X-BRING-USER-UUID'] = userUuid;
  }

  const body = `&purchase=&recently=${encodeURIComponent(itemName)}&specification=&remove=&sender=null`;

  const res = await fetch(`${BRING_API_BASE}bringlists/${listUuid}`, {
    method: 'PUT',
    headers,
    body
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Artikel "${itemName}" konnte nicht abgehakt werden (${res.status})`);
  }
  return true;
}

/**
 * Remove an item permanently from the list
 */
export async function bringRemoveItem(listUuid, userUuid, token, itemName) {
  const headers = {
    ...BRING_HEADERS,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  };
  if (userUuid) {
    headers['X-BRING-USER-UUID'] = userUuid;
  }

  const body = `&purchase=&recently=&specification=&remove=${encodeURIComponent(itemName)}&sender=null`;

  const res = await fetch(`${BRING_API_BASE}bringlists/${listUuid}`, {
    method: 'PUT',
    headers,
    body
  });

  if (!res.ok && res.status !== 204) {
    throw new Error(`Artikel "${itemName}" konnte nicht entfernt werden (${res.status})`);
  }
  return true;
}
