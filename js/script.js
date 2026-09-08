import { createModalA11y } from './modal-a11y.js';
import { createToast } from './toast.js';
import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initCoinModal } from './coin-modal.js';
import { initWatchlist } from './watchlist.js';
import { initNotifications } from './notifications.js';
import { initTrades } from './trades.js';
import { initProfile } from './profile.js';
import { initSettings } from './settings.js';
import { initShortcuts } from './shortcuts.js';
import { initDataSync } from './data-sync.js';
import { initTraining } from './training.js';

const modalA11y = createModalA11y();
const { showToast } = createToast();

initTheme();
initDataSync({ showToast });
initNavigation();
const { openCoinModal } = initCoinModal({ showToast, modalA11y });
initWatchlist({ showToast });
initNotifications({ modalA11y });
initTrades({ openCoinModal, modalA11y });
initProfile({ showToast });
initSettings({ showToast });
initShortcuts();
initTraining();
