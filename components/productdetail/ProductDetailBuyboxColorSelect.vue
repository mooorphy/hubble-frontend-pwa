<template>
    <div v-if="!empty(dataProductsCrossBuybox)" class="color-select-wrp">
        <div class="color-label">
            {{ $t('Color') }} {{ $t('select') }}:
            <span class="selected-color"> {{ selectedColor }} </span>
        </div>
        <div class="colors-wrp">
            <ul class="color-list">
                <nuxt-link v-for="item in dataProductsCrossBuybox" :key="item.id" :to="item.url_pds">
                    <img-lazy :src="routeUrlColorThumbnail(item.image)" alt-info="Farbvariante Produkt" title-info="Farbvariante Produkt" />
                </nuxt-link>
            </ul>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: "ProductDetailBuyboxColorSelect",

        props: {
            productId: {
                type: Number,
                required: true
            }
        },

        computed: {
            ...mapState({
                dataProduct: state => state.modApiResources.dataProduct,
                dataProductsCrossBuybox: state => state.modApiResources.dataProductsCrossBuybox
            }),
            productData() {
                return this.dataProduct.result.item;
            },
            selectedColor() {
                return this.productData.statistic_item.color_label;
            }
        },

        mounted() {
            this.getProductsCrossBuybox();
        },

        methods: {
            getProductsCrossBuybox: function() {
                return new Promise((resolve) => {
                    // Get cross-selling products from api
                    this.$store.dispatch('modApiResources/getProductsCrossBuybox', {
                        data: this.productId
                    }).then(() => {
                        resolve('ok');
                    }).catch((error) => {
                        console.log('Failed to fetch: ', error);
                    });
                })
            },
            routeUrlColorThumbnail(image) {
                // If customer domain isset get live images
                if(!_.isEmpty(process.env.CUSTOMER_DOMAIN)) {
                    let _letters = _.split(image, '', 2);

                    let _reference = _.join(
                        [
                            process.env.CUSTOMER_DOMAIN,
                            'images/catalog/thumbnails/cache/400',
                            // 'media/catalog/product',
                            // _letters[0],
                            // _letters[1],
                            image
                        ],
                        '/'
                    );

                    return _reference;
                }

                let _path = _.trim(process.env.config.IMG_BASE_URL, '/');
                return _path + '/images/catalog/product/40x/' + image
            },
            empty: function(p) {
                return _.isEmpty(p);
            }
        }
    }
</script>
