#include "sentry_safety.h"

#include <cmath>
#include <algorithm>

#include "baldr/directededge.h"
#include "baldr/graphtile.h"
#include "baldr/graphconstants.h"
#include "midgard/constants.h"
#include "midgard/logging.h"
#include "sif/costconstants.h"

namespace valhalla
{
    namespace sif
    {

        // ------------------------------------------------------------
        // Constructor
        // ------------------------------------------------------------
        SentrySafetyCost::SentrySafetyCost(const Costing &costing,
                                           const SafetyOptions &options)
            : DynamicCost(costing), opts_(options)
        {

            // Precompute weather multipliers
            night_factor_ = opts_.is_night ? opts_.night_penalty : 1.0f;

            weather_factor_ = 1.0f;
            if (opts_.fog_penalty > 1.0f && opts_.visibility_meters < 500)
                weather_factor_ *= opts_.fog_penalty;

            if (opts_.snow_mm_per_hour > 0)
                weather_factor_ *= opts_.snow_penalty;

            if (opts_.temperature_celsius < 0)
                weather_factor_ *= opts_.icing_penalty;
        }

        // ------------------------------------------------------------
        // SAFETY FACTOR (your main logic)
        // ------------------------------------------------------------
        float SentrySafetyCost::ComputeSafetyFactor(const baldr::DirectedEdge *edge) const
        {
            float factor = 1.0f;

            // Road class multiplier
            uint32_t rc = edge->classification();
            if (rc < 8)
                factor *= opts_.road_class_factor[rc];

            // Weather multipliers
            factor *= weather_factor_;
            factor *= night_factor_;

            // Surface safety
            switch (edge->surface())
            {
            case baldr::Surface::kPavedSmooth:
            case baldr::Surface::kPaved:
                factor *= opts_.surface_paved_factor;
                break;
            case baldr::Surface::kGravel:
                factor *= opts_.surface_gravel_factor;
                break;
            case baldr::Surface::kDirt:
                factor *= opts_.surface_dirt_factor;
                break;
            case baldr::Surface::kUnpaved:
                factor *= opts_.surface_unpaved_factor;
                break;
            default:
                factor *= opts_.surface_unknown_factor;
                break;
            }

            return factor;
        }

        // ------------------------------------------------------------
        // EDGE COST
        // ------------------------------------------------------------
        Cost SentrySafetyCost::EdgeCost(const baldr::DirectedEdge *edge,
                                        const baldr::GraphId &edgeid,
                                        const baldr::graph_tile_ptr &tile,
                                        const baldr::TimeInfo &time_info,
                                        uint8_t &flow_sources) const
        {

            // Base travel time
            float speed = edge->speed();
            float seconds = edge->length() / speed;

            // Apply safety multiplier
            float safety = ComputeSafetyFactor(edge);
            float cost = seconds * safety;

            return {cost, seconds};
        }

        // ------------------------------------------------------------
        // TURN COST
        // ------------------------------------------------------------
        Cost SentrySafetyCost::TransitionCost(const baldr::DirectedEdge *edge,
                                              const baldr::NodeInfo *node,
                                              const EdgeLabel &pred,
                                              const baldr::graph_tile_ptr &tile,
                                              const std::function<baldr::LimitedGraphReader()> &reader_getter) const
        {

            float turn_factor = 1.0f;

            auto turn = pred.turntype();

            if (turn == baldr::Turn::Type::kLeft)
                turn_factor *= opts_.left_turn_penalty;

            if (turn == baldr::Turn::Type::kRight)
                turn_factor *= opts_.right_turn_penalty;

            if (turn == baldr::Turn::Type::kUTurn)
                turn_factor *= opts_.uturn_penalty;

            return {turn_factor, 0};
        }

        // ------------------------------------------------------------
        // ALLOWED
        // ------------------------------------------------------------
        bool SentrySafetyCost::Allowed(const baldr::DirectedEdge *edge,
                                       const bool is_dest,
                                       const EdgeLabel &pred,
                                       const baldr::graph_tile_ptr &tile,
                                       const baldr::GraphId &edgeid,
                                       const uint64_t current_time,
                                       const uint32_t tz_index,
                                       uint8_t &restriction_idx,
                                       uint8_t &destonly_access_restr_mask) const
        {

            // Example rule: forbid icy dirt roads
            if (edge->surface() == baldr::Surface::kDirt &&
                opts_.temperature_celsius < 0)
                return false;

            return true;
        }

        bool SentrySafetyCost::Allowed(const baldr::DirectedEdge *edge,
                                       const baldr::graph_tile_ptr &tile,
                                       uint16_t disallow_mask) const
        {
            return true;
        }

        // ------------------------------------------------------------
        // A* HEURISTIC
        // ------------------------------------------------------------
        float SentrySafetyCost::AStarCostFactor() const
        {
            return opts_.safety_vs_speed_balance;
        }

        // ------------------------------------------------------------
        // FACTORY
        // ------------------------------------------------------------
        std::shared_ptr<DynamicCost> CreateSentrySafetyCost(
            const Costing &costing,
            const SafetyOptions &options)
        {

            return std::make_shared<SentrySafetyCost>(costing, options);
        }

    } // namespace sif
} // namespace valhalla
