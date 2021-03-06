<template>
    <div class="listing-wrp row" :class="extraClass">

        <template v-if="isSlider">
            <client-only>
                <slider
                    :responsive="responsive"
                    :controls-text="controls"
                    :loop="loop"
                    :gutter="10"
                    :edge-padding="10"
                    :nav="false"
                    :lazyload="true"
                >
                    <template v-for="(item, index) in dataItems">
                        <div :key="index" class="slider-item">
                            <product-listing-card :key="item.id" :item-orig="item" :is-slider="isSlider" />
                        </div>
                    </template>
                </slider>
            </client-only>
        </template>

        <div v-for="(item, index) in dataItems" v-if="!isSlider" :key="index" class="listing-item col-6 col-sm-6 col-md-4 col-lg-3">
            <product-listing-card :key="item.id" :item-orig="item" />
        </div>

        <g-t-m-product-impressions :products="dataItems" :list="list" :category="category" />

    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import GTMProductImpressions from "../utils/GTMProductImpressions";
    import ProductListingCard from "./ProductListingCard";

    export default {
        name: 'ProductListing',

        components: {ProductListingCard, GTMProductImpressions},

        props: {
            dataItems: {
                type: Array,
                required: true
            },
            isSlider: {
                type: Boolean,
                default: false,
                required: false
            },
            loop: {
                type: Boolean,
                default: true,
                required: false
            },
            responsive: {
                type: Object,
                required: false,
                default() {
                    return {
                        0: {
                            items: 2,
                            mouseDrag: true,
                            controls: true
                        },
                        500: {
                            items: 3,
                            mouseDrag: true,
                            controls: true
                        },
                        1000: {
                            items: 6,
                            controls: true,
                            mouseDrag: false
                        }
                    }
                }
            },
            list: {
                type: String,
                required: false,
                default: ''
            },
            category: {
                type: String,
                required: false,
                default: ''
            },
            extraClass: {
                type: Object,
                required: false,
                default: () => {}
            }
        },

        data () {
            return {
                controls: [
                    '<i class="icon icon-chevron-left"></i><span class="hidden-link-name">Navigate left</span>',
                    '<i class="icon icon-chevron-right"></i><span class="hidden-link-name">Navigate right</span>'
                ]
            }
        },

        computed: {
            ...mapState({
                dataCategoryProducts: state => state.modApiResources.dataCategoryProducts,
                paginationPerPage: state => state.modApiRequests.paginationPerPage
            }),
            classes() {
                return [
                    ! this.isSlider ? 'columns is-flex is-multiline' : ''
                ];
            },
            categoryProductStats() {
                if(!_.isEmpty(this.dataCategoryProducts)) {
                    return this.dataCategoryProducts.result.stats;
                }

                return false;
            },
            paginationItemsTotal() {
                return this.categoryProductStats.total || 0;
            },
            curPage() {
                // If page isset to url take it, otherwise set to first page
                let currentPage = 1;

                if(this.$route.query.page) {
                    currentPage = parseInt(this.$route.query.page);
                }

                return currentPage;
            },
            curPerPage() {
                return parseInt(this.paginationPerPage);
            },
            lastPage() {
                let _last = _.round(this.paginationItemsTotal / this.curPerPage, 4);

                if(_last > _.round(_last)) {
                    return _.round(_last) + 1;
                }

                return _.round(_last);
            },
            prevPage() {
                return this.curPage - 1;
            },
            nextPage() {
                return this.curPage + 1;
            },
        },

        head() {
            if(!this.isSlider) {
                let link = [],
                    _path = _.trim(process.env.APP_BASE_URL, '/').concat(this.$router.currentRoute.path),
                    urlCanonical = _path,
                    urlNext = _path.concat('?page=' + this.nextPage ),
                    urlPrev = _path.concat('?page=' + this.prevPage );

                if(this.curPage !== 1) {
                    urlCanonical = _path.concat('?page=' + this.curPage )
                }

                if (this.curPage !== 1 || !_.isEmpty(this.$route.query.page)) {
                    link.push({ rel: 'prev', href: urlPrev });
                }

                if (this.curPage !== this.lastPage) {
                    link.push({ rel: 'next', href: urlNext });
                }

                link.push({ rel: 'canonical', href: urlCanonical });

                return {
                    link: link
                }
            }
        }
    }
</script>
