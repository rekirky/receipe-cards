import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { CostingSession } from '../../types'
import { calcLineCost, calcTotalCost } from '../../utils/costing'
import { formatCurrency, formatUnit } from '../../utils/units'

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.ttf' },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.ttf', fontWeight: 700 },
  ],
})

const DARK = '#1c1917'
const MID = '#44403c'
const LIGHT = '#78716c'
const WHITE = '#ffffff'
const OFF_WHITE = '#f5f5f4'

function makeStyles(ember: string) {
  return StyleSheet.create({
    page: { backgroundColor: DARK, fontFamily: 'Inter', padding: 0 },
    header: {
      backgroundColor: '#0c0a09', paddingHorizontal: 36, paddingTop: 28, paddingBottom: 20,
      borderBottomWidth: 3, borderBottomColor: ember,
    },
    headerTitle: { color: WHITE, fontSize: 26, fontWeight: 700, letterSpacing: 2 },
    headerSub: { color: '#a8a29e', fontSize: 10, marginTop: 4 },
    meta: { paddingHorizontal: 36, paddingVertical: 14, flexDirection: 'row', gap: 24, borderBottomWidth: 1, borderBottomColor: MID },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaLabel: { color: LIGHT, fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
    metaValue: { color: OFF_WHITE, fontSize: 10, fontWeight: 700 },
    tableWrap: { paddingHorizontal: 36, paddingTop: 18 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: ember, paddingBottom: 6, marginBottom: 2 },
    colIngredient: { flex: 3, color: LIGHT, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
    colPack: { flex: 2, color: LIGHT, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' },
    colUsed: { flex: 2, color: LIGHT, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' },
    colCost: { flex: 2, color: LIGHT, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: MID, paddingVertical: 7, alignItems: 'center' },
    cellIngredient: { flex: 3, color: OFF_WHITE, fontSize: 10 },
    cellPack: { flex: 2, color: '#a8a29e', fontSize: 9, textAlign: 'right' },
    cellUsed: { flex: 2, color: '#a8a29e', fontSize: 9, textAlign: 'right' },
    cellCost: { flex: 2, color: ember, fontSize: 10, fontWeight: 700, textAlign: 'right' },
    summaryWrap: { paddingHorizontal: 36, paddingTop: 18, flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
    summaryBox: { backgroundColor: MID, borderRadius: 6, padding: 12, minWidth: 140, alignItems: 'flex-end' },
    summaryLabel: { color: LIGHT, fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
    summaryValue: { color: WHITE, fontSize: 16, fontWeight: 700 },
    summaryHighlight: { color: ember, fontSize: 16, fontWeight: 700 },
    footer: { position: 'absolute', bottom: 16, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { color: LIGHT, fontSize: 7 },
  })
}

interface Props {
  session: CostingSession
  themeColour: string
}

export default function CostingPdfDocument({ session, themeColour }: Props) {
  const s = makeStyles(themeColour)
  const total = calcTotalCost(session.ingredients)
  const perPortion = session.portionCount > 0 ? total / session.portionCount : 0
  const date = new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Document title={`Menu Costing — ${session.recipeName || 'Untitled'}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.headerTitle}>MENU COSTING</Text>
          {session.recipeName ? <Text style={s.headerSub}>{session.recipeName}</Text> : null}
        </View>

        <View style={s.meta}>
          <View style={s.metaItem}><Text style={s.metaLabel}>Date:</Text><Text style={s.metaValue}>{date}</Text></View>
          <View style={s.metaItem}><Text style={s.metaLabel}>Portions:</Text><Text style={s.metaValue}>{session.portionCount}</Text></View>
          <View style={s.metaItem}><Text style={s.metaLabel}>Ingredients:</Text><Text style={s.metaValue}>{session.ingredients.length}</Text></View>
        </View>

        <View style={s.tableWrap}>
          <View style={s.tableHeader}>
            <Text style={s.colIngredient}>Ingredient</Text>
            <Text style={s.colPack}>Pack Size / Cost</Text>
            <Text style={s.colUsed}>Used Amount</Text>
            <Text style={s.colCost}>Line Cost</Text>
          </View>
          {session.ingredients.map((ing) => {
            const lineCost = calcLineCost(ing)
            return (
              <View key={ing.id} style={s.row}>
                <Text style={s.cellIngredient}>{ing.name || '—'}</Text>
                <Text style={s.cellPack}>{ing.purchaseWeight} {formatUnit(ing.purchaseUnit)} / {formatCurrency(ing.purchaseCost)}</Text>
                <Text style={s.cellUsed}>{ing.usedAmount} {formatUnit(ing.usedUnit)}</Text>
                <Text style={s.cellCost}>{lineCost > 0 ? formatCurrency(lineCost) : '—'}</Text>
              </View>
            )
          })}
        </View>

        <View style={s.summaryWrap}>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Total Batch Cost</Text>
            <Text style={s.summaryValue}>{formatCurrency(total)}</Text>
          </View>
          <View style={s.summaryBox}>
            <Text style={s.summaryLabel}>Cost Per Portion</Text>
            <Text style={s.summaryHighlight}>{formatCurrency(perPortion)}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Menu Costing Sheet</Text>
          <Text style={s.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  )
}
