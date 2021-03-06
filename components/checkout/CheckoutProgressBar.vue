<template>
    <div class="container progress-bar-wrp">
        <nuxt-link class="step" :to="localePath('checkout-login')">
            <div v-if="!isLoggedIn" class="no">
                1
            </div>
            <div v-if="isLoggedIn" class="icon icon-check" />
            {{ $t('Login') }}
        </nuxt-link>
        <nuxt-link class="step" :to="localePath('checkout-payment')">
            <div v-if="!paymentSelected && !isOrderSuccess" class="no">
                2
            </div>
            <div v-if="paymentSelected || isOrderSuccess" class="icon icon-check" />
            {{ $t('Payment') }}
        </nuxt-link>
        <div class="step" :class="{'nuxt-link-exact-active': isCurrentPath('checkout-summary')}" @click="createOrder()">
            <div v-if="!isOrderSuccess" class="no">
                3
            </div>
            <div v-if="isOrderSuccess" class="icon icon-check" />
            {{ $t('Confirm') }}
        </div>
        <div class="step" :class="{'nuxt-link-exact-active': isCurrentPath('checkout-success')}">
            <div class="no">
                4
            </div>
            {{ $t('Complete') }}
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "CheckoutProgressBar",
        data() {
            return {
                isOrderSuccess: false
            }
        },
        computed: {
            ...mapState({
                customer: state => state.modApiPayment.customer,
                order: state => state.modApiPayment.order,
                hostedIFrame: state => state.modApiPayment.hostedIFrame
            }),
            isLoggedIn: function() {
                if(!_.isEmpty(this.customer.customerAuth)) {
                    return this.customer.customerAuth.token;
                }

                return false;
            },
            paymentSelected: function() {
                if(!_.isEmpty(this.order.chosenPaymentMethod)) {
                    return this.order.chosenPaymentMethod;
                }

                return false;
            }
        },
        watch: {
            '$route.path': function() {
                this.isOrderSuccess = false;
                if(this.$router.history.current.fullPath === '/checkout/success') {
                    this.isOrderSuccess = true;
                }
            }
        },
        created() {
            if(this.$router.history.current.fullPath === '/checkout/success') {
                this.isOrderSuccess = true;
            }
        },
        methods: {
            createOrder: function() {
                if(this.order.chosenPaymentMethod.key === 'payone_cc') {
                    if (this.hostedIFrame.isComplete()) {
                        // Perform "CreditCardCheck" to create and get a PseudoCardPan; then call your function "hostedIFramePayCallback"
                        this.hostedIFrame.creditCardCheck('hostedIFramePayCallback');
                    } else {
                        this.$store.dispatch('modFlash/flashMessage', {
                            flashType: 'error',
                            flashMessage: this.$t('Please complete your credit card information')
                        });
                        console.log("Not complete. Nothing done.");
                    }
                    return;
                }
                // Errorhandling for iban and bic inputs for payments like sb or elv
                if(this.order.chosenPaymentMethod.key === 'payone_sb') {

                    let error = false;

                    this.$store.commit('modApiPayment/setIbanError', false);
                    this.$store.commit('modApiPayment/setBicError', false);

                    if(_.isEmpty(this.order.chosenPaymentMethod.payload.iban)) {
                        this.$store.commit('modApiPayment/setIbanError', true);
                        error = true;
                        this.$store.dispatch('modFlash/flashMessage', {
                            flashType: 'error',
                            flashMessage: this.$t('Please insert valid IBAN')
                        });
                    }

                    if(_.isEmpty(this.order.chosenPaymentMethod.payload.bic)) {
                        this.$store.commit('modApiPayment/setBicError', true);
                        error = true;
                        this.$store.dispatch('modFlash/flashMessage', {
                            flashType: 'error',
                            flashMessage: this.$t('Please insert valid BIC')
                        });
                    }

                    if(error) {
                        return;
                    }
                }
                // Get uuid from api
                this.$store.dispatch('modApiPayment/getUuid').then((uuid) => {

                    // Store uuid as orderId to order in store
                    this.$store.commit('modApiPayment/setOrderId', uuid);

                    // Validate order and save to cookie then redirect to summary page
                    this.$store.dispatch('modApiPayment/createOrder').then(() => {
                        this.$router.push({
                            path: this.localePath('checkout-summary')
                        });
                    }).catch((error) => {
                        this.$store.dispatch('modFlash/flashMessage', {
                            flashType: 'error',
                            flashMessage: this.$t(error)
                        });
                        console.log(error);
                    });
                });
            },
            isCurrentPath: function(routeName) {
                if(this.$route.name.includes(routeName)) {
                    return true;
                }
            }
        }
    }
</script>
