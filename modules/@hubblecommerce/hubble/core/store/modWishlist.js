//
// modWishlist
//
import base64 from 'base-64'
import localStorageHelper from "@hubblecommerce/hubble/core/utils/localStorageHelper";

export default function (ctx) {

    // Create vuex store module
    const modWishlist = {
        namespaced: true,
        state: () => ({
            wishlistItemsCount: 0,
            wishlistItemsObj: {},
            wishlistId: false,

            cookieName: 'hubbleWishlist',
            cookiePath: '/',
            cookieTTL: 120, // minutes
            localStorageLifetime: 720 // 720 hours = 30 days
        }),
        getters: {
            getCookieExpires: (state) => {
                return new Date(new Date().getTime() + state.cookieTTL * 60 * 1000);
            },
            getWishlistItemsCount: state => {
                return state.wishlistItemsCount;
            },
            getWishlistItemsObj: state => {
                return state.wishlistItemsObj;
            },
            getWishlistEncoded: () => (objJsonStr) => {
                return base64.encode(JSON.stringify(objJsonStr));
            },
            getWishlistDecoded: () => (objJsonB64) => {
                return JSON.parse(base64.decode(objJsonB64));
            }
        },
        mutations: {
            setWishlistItemsCount: (state, qty) => {
                state.wishlistItemsCount = qty;
            },
            delWishlistItemObj: (state, item) => {
                state.wishlistItemsObj = _.omit(state.wishlistItemsObj, item.id)
            },
            setWishlistItemObj: (state, item) => {
                state.wishlistItemsObj[item.id] = item;
            },
            setWishlistItemsObj: (state, items) => {
                state.wishlistItemsObj = items;
            },
            setWishlistItemsObjQty: (state, payload) => {
                state.wishlistItemsObj[payload.itemId]['qty'] = payload.itemQty;
            },
            setWishlistId: (state, payload) => {
                state.wishlistId = payload;
            },
        },
        actions: {
            clearAll({commit}) {
                // console.log("clearAll called");

                return new Promise((resolve) => {

                    commit('setWishlistItemsObj', {});
                    commit('setWishlistItemsCount', 0);

                    resolve('wishlist cleared!');
                })
            },
            addItem({commit, state, dispatch}, payload) {
                // console.log("addItem ... payload: %o", payload);

                return new Promise((resolve, reject) => {

                    let item = _.pick(payload.item, ['id', 'sku', 'qty', 'variants', 'name', 'image', 'final_price_item', 'url_pds']);
                    let qty = payload.qty;

                    // Set item to wishlist if not exists
                    if(!state.wishlistItemsObj.hasOwnProperty(item.id)) {
                        commit('setWishlistItemObj', item);
                        commit('setWishlistItemsObjQty', {
                            itemId: item.id,
                            itemQty: qty
                        });
                    } else {
                        commit('setWishlistItemsObjQty', {
                            itemId: item.id,
                            itemQty: parseInt(state.wishlistItemsObj[item.id]['qty']) + qty
                        });
                    }

                    // Increase global wishlist counter
                    commit('setWishlistItemsCount', state.wishlistItemsCount + qty);

                    dispatch('saveToStore');

                    resolve('OK, item added!');
                });
            },
            updateItem({commit, state, dispatch}, payload) {
                // console.log("addItem ... payload: %o", payload);

                return new Promise((resolve) => {
                    // Update global wishlist counter
                    commit('setWishlistItemsCount', state.wishlistItemsCount + payload.qty );

                    dispatch('saveToStore');

                    resolve('OK, item added!');
                });
            },
            delItem({commit, state, dispatch}, payload) {
                //console.log("delItem ... payload: %o", payload);

                let item = payload.data;

                return new Promise((resolve) => {

                    if(state.wishlistItemsObj[item.id]["qty"] > 1) {
                        commit('setWishlistItemsObjQty', {
                            itemId: item.id,
                            itemQty: state.wishlistItemsObj[item.id]["qty"] - 1
                        });
                    } else {
                        commit('delWishlistItemObj', item);
                    }

                    commit('setWishlistItemsCount', state.wishlistItemsCount - 1);

                    dispatch('saveToStore');

                    resolve('OK, item deleted!');
                })
            },
            saveToStore({state}) {
                return new Promise((resolve) => {

                    let _item = {
                        count: state.wishlistItemsCount,
                        id: state.wishlistId,
                        items: state.wishlistItemsObj
                    };

                    localStorageHelper.setCreatedAt(_item, state.localStorageLifetime).then(response => {
                        // Store wishlist with all info in local storage
                        this.$localForage.setItem(state.cookieName, response);
                        resolve('wishlist stored');
                    });

                })
            },
            setByForage({commit, state}) {
                return new Promise((resolve) => {
                    this.$localForage.getItem(state.cookieName).then((response) => {

                        if(response !== null) {

                            // Remove local storage if its invalid (end of lifetime)
                            if(!localStorageHelper.lifeTimeIsValid(response, state.localStorageLifetime)) {
                                this.$localForage.removeItem(state.cookieName);
                                resolve({
                                    success: true,
                                    message: 'local storage was cleared for its invalidity',
                                    redirect: true
                                });
                            }

                            commit('setWishlistItemsObj', response.items || {});
                            commit('setWishlistItemsCount', response.count || 0);
                            commit('setWishlistId', response.id || false);

                            resolve({
                                success: true,
                                message: 'wishlist taken from forage.',
                                redirect: true
                            });
                        }

                        resolve({
                            success: true,
                            message: 'wishlist not known by forage.'
                        });

                    });
                })
            },
            setWishlist({commit, state}, payload) {
                return new Promise((resolve) => {

                    console.log(payload);

                });
            },
            deleteWishlist({commit, state}) {
                return new Promise(() => {
                    commit('setWishlistItemsCount', 0);
                    commit('setWishlistItemsObj', {});
                    commit('setWishlistId', false);

                    // Remove wishlist from local storage
                    this.$localForage.removeItem(state.cookieName);
                });
            }
        }
    };

    // Register vuex store module
    ctx.store.registerModule('modWishlist', modWishlist);
}
